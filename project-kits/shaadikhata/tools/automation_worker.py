#!/usr/bin/env python3
"""
Phere automation worker.

Runs queued automation_jobs from Supabase using only Python stdlib.

Local smoke:
  python tools/automation_worker.py --self-test

Production-style one-shot:
  set SUPABASE_URL=https://project.supabase.co
  set SUPABASE_SERVICE_ROLE_KEY=...
  python tools/automation_worker.py --once --limit 5
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timezone
from typing import Any, Dict, Iterable, List, Optional, Tuple


Json = Dict[str, Any]


def as_list(value: Any) -> List[Any]:
    return value if isinstance(value, list) else []


def to_num(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def date_only(value: Any) -> str:
    if not value:
        return ""
    return str(value)[:10]


def day_diff(value: Any, today: str) -> Optional[int]:
    raw = date_only(value)
    if not raw:
        return None
    try:
        target = date.fromisoformat(raw)
        base = date.fromisoformat(today)
    except ValueError:
        return None
    return (target - base).days


def build_daily_digest(data: Json, today: Optional[str] = None) -> Json:
    today = today or date.today().isoformat()
    settings = data.get("settings") or {}
    expenses = as_list(data.get("expenses"))
    lena = as_list(data.get("lena"))
    dena = as_list(data.get("dena"))
    saman_invoices = as_list(data.get("samanInvoices") or data.get("saman"))

    pending_expenses = [item for item in expenses if item.get("status") != "Paid"]
    due_expenses = [
        item for item in pending_expenses
        if (diff := day_diff(item.get("dueDate"), today)) is not None and diff <= 2
    ]

    ledger_rows: List[Json] = []
    for item in lena:
        if item.get("status") != "Settled":
            ledger_rows.append({**item, "ledgerType": "receive"})
    for item in dena:
        if item.get("status") != "Settled":
            ledger_rows.append({**item, "ledgerType": "pay"})

    overdue_ledger = [
        item for item in ledger_rows
        if (diff := day_diff(item.get("dueDate"), today)) is not None and diff < 0
    ]

    shopping_due: List[Json] = []
    for invoice in saman_invoices:
        items = [
            item for item in as_list(invoice.get("items"))
            if item.get("name") and item.get("status") != "bought"
        ]
        diff = day_diff(invoice.get("dueBy"), today)
        if items and diff is not None and diff <= 2:
            shopping_due.append({"list": invoice, "items": items, "diff": diff})

    shopping_overdue = [row for row in shopping_due if row["diff"] < 0]
    total_spent = sum(to_num(item.get("amount")) for item in expenses if item.get("status") == "Paid")
    total_pending = sum(
        max(0.0, to_num(item.get("amount")) - to_num(item.get("paidAmount")))
        for item in pending_expenses
    )
    total_budget = to_num(settings.get("totalBudget"))
    budget_left = max(0.0, total_budget - total_spent)

    actions: List[str] = []
    if due_expenses:
        actions.append(f"{len(due_expenses)} expense payment(s) due soon")
    if overdue_ledger:
        actions.append(f"{len(overdue_ledger)} Lena-Dena follow-up(s) overdue")
    if shopping_overdue:
        actions.append(f"{len(shopping_overdue)} shopping list(s) overdue")
    if total_budget and budget_left / total_budget < 0.15:
        actions.append("Budget buffer is below 15%")

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "today": today,
        "coupleName": settings.get("coupleName") or "",
        "budget": {
            "total": total_budget,
            "spent": total_spent,
            "pending": total_pending,
            "left": budget_left,
        },
        "counts": {
            "expensesPending": len(pending_expenses),
            "expensesDueSoon": len(due_expenses),
            "ledgerPending": len(ledger_rows),
            "ledgerOverdue": len(overdue_ledger),
            "shoppingListsDueSoon": len(shopping_due),
            "shoppingListsOverdue": len(shopping_overdue),
        },
        "actions": actions,
    }


def digest_text(digest: Json) -> str:
    name = f"{digest.get('coupleName')}: " if digest.get("coupleName") else ""
    counts = digest.get("counts") or {}
    return (
        f"{name}{len(digest.get('actions') or [])} priority action(s). "
        f"Pending expenses: {counts.get('expensesPending', 0)}. "
        f"Ledger overdue: {counts.get('ledgerOverdue', 0)}. "
        f"Shopping due: {counts.get('shoppingListsDueSoon', 0)}."
    )


class SupabaseRest:
    def __init__(self, url: str, service_key: str):
        self.url = url.rstrip("/")
        self.service_key = service_key

    def request(self, method: str, path: str, body: Any = None, query: Optional[Json] = None) -> Any:
        params = f"?{urllib.parse.urlencode(query or {}, doseq=True)}" if query else ""
        endpoint = f"{self.url}/rest/v1/{path}{params}"
        payload = None if body is None else json.dumps(body).encode("utf-8")
        req = urllib.request.Request(endpoint, data=payload, method=method)
        req.add_header("apikey", self.service_key)
        req.add_header("Authorization", f"Bearer {self.service_key}")
        req.add_header("Content-Type", "application/json")
        req.add_header("Accept", "application/json")
        if method in {"POST", "PATCH"}:
            req.add_header("Prefer", "return=representation")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read().decode("utf-8")
                return json.loads(raw) if raw else None
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Supabase {method} {path} failed {exc.code}: {raw}") from exc

    def claim_jobs(self, worker_id: str, limit: int) -> List[Json]:
        return self.request("POST", "rpc/claim_automation_jobs", {
            "p_worker_id": worker_id,
            "p_limit": limit,
        }) or []

    def patch_job(self, job_id: str, patch: Json) -> None:
        self.request("PATCH", "automation_jobs", patch, {"id": f"eq.{job_id}"})

    def insert_notification(self, row: Json) -> None:
        self.request("POST", "automation_notifications", row)

    def fetch_owner_data(self, wedding_id: str) -> Json:
        weddings = self.request("GET", "weddings", query={
            "select": "owner_id",
            "id": f"eq.{wedding_id}",
            "limit": "1",
        }) or []
        owner_id = (weddings[0] or {}).get("owner_id") if weddings else None
        if not owner_id:
            return {}
        rows = self.request("GET", "wedding_data", query={
            "select": "data",
            "user_id": f"eq.{owner_id}",
            "limit": "1",
        }) or []
        return (rows[0] or {}).get("data") or {} if rows else {}


def process_job(client: SupabaseRest, job: Json) -> Tuple[Json, Optional[Json]]:
    job_type = job.get("type")
    payload = job.get("payload") or {}
    data = payload.get("data_snapshot")
    if not isinstance(data, dict):
        data = client.fetch_owner_data(job["wedding_id"])

    if job_type not in {"daily_digest", "shopping_reminder", "payment_aging", "data_health"}:
        result = {
            "message": f"{job_type} worker is queued for future implementation",
            "workerVersion": 1,
        }
        return result, {
            "title": "Automation job noted",
            "body": result["message"],
            "severity": "info",
        }

    digest = build_daily_digest(data)
    result = {
      "digest": digest,
      "summary": digest_text(digest),
      "workerVersion": 1,
    }
    return result, {
        "title": "Daily digest ready",
        "body": result["summary"],
        "severity": "success" if not digest.get("actions") else "warning",
    }


def run_once(client: SupabaseRest, worker_id: str, limit: int) -> int:
    jobs = client.claim_jobs(worker_id, limit)
    for job in jobs:
        try:
            result, notification = process_job(client, job)
            client.patch_job(job["id"], {
                "status": "success",
                "result": result,
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })
            if notification:
                client.insert_notification({
                    "wedding_id": job["wedding_id"],
                    "job_id": job["id"],
                    "type": job.get("type") or "automation",
                    "title": notification["title"],
                    "body": notification["body"],
                    "severity": notification["severity"],
                    "metadata": {"jobType": job.get("type")},
                })
            print(f"ok {job['id']} {job.get('type')}")
        except Exception as exc:  # noqa: BLE001 - worker must record failures
            retry = job.get("attempts", 0) < job.get("max_attempts", 3)
            client.patch_job(job["id"], {
                "status": "queued" if retry else "failed",
                "run_after": datetime.now(timezone.utc).isoformat() if retry else None,
                "error": str(exc)[:2000],
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "completed_at": None if retry else datetime.now(timezone.utc).isoformat(),
            })
            print(f"fail {job['id']} {exc}", file=sys.stderr)
    return len(jobs)


def self_test() -> None:
    digest = build_daily_digest({
        "settings": {"coupleName": "Priya & Rohan", "totalBudget": 100000},
        "expenses": [
            {"description": "Mandap", "amount": 10000, "status": "Pending", "dueDate": date.today().isoformat()},
            {"description": "DJ", "amount": 20000, "status": "Paid"},
        ],
        "lena": [{"person": "Chacha", "amount": 5000, "status": "Pending", "dueDate": "2026-01-01"}],
        "dena": [],
        "samanInvoices": [{"title": "Haldi", "dueBy": date.today().isoformat(), "items": [{"name": "Haldi", "status": "to_buy"}]}],
    })
    assert digest["counts"]["expensesPending"] == 1
    assert digest["counts"]["shoppingListsDueSoon"] == 1
    assert "Priya & Rohan" in digest_text(digest)
    print(json.dumps({"ok": True, "summary": digest_text(digest)}, indent=2))


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Run Phere automation jobs")
    parser.add_argument("--once", action="store_true", help="Claim and process one batch")
    parser.add_argument("--loop", action="store_true", help="Continuously poll for jobs")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--sleep", type=int, default=30)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args(list(argv) if argv is not None else None)

    if args.self_test:
        self_test()
        return 0

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required", file=sys.stderr)
        return 2

    client = SupabaseRest(url, key)
    worker_id = os.environ.get("AUTOMATION_WORKER_ID") or f"python-worker-{os.getpid()}"

    if args.loop:
        while True:
            count = run_once(client, worker_id, args.limit)
            time.sleep(args.sleep if count == 0 else 1)
    else:
        run_once(client, worker_id, args.limit)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
