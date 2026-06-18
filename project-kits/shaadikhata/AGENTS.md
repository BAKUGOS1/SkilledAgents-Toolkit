# Phere 9-Agent Manager System

This repo uses a clearly named developer-side operating model: **Phere 9-Agent Manager**.

The core team has 9 engineering agents. Enterprise mode adds specialist agents for large-company-style work, and optional business agents run only after coding is done or when the user explicitly asks for them. This is an enterprise-style process, not a claim that Phere is certified, deployed, or accepted by any company.

This repo also exposes a reusable multi-project layer: **Karynth AgentOS by NexusOps**. Karynth keeps Phere commands backward-compatible while adding client-facing role names, project profiles, research catalogues, and local run ledgers.

Main skill: `.agents/skills/phere-9-agent-manager`

Readable guide: `docs/PHERE_9_AGENT_MANAGER_SYSTEM.md`

Free current-Codex handoff guide: `docs/PHERE_CODEX_HANDOFF_QUEUE.md`

Codex-only autonomous mode: use `npm run agents:codex -- "<task>"` as the local role contract, then Codex should continue in the same session through the selected agents instead of waiting for manual prompt handoff.

Agent/Brain improvement roadmap: `docs/PHERE_AGENT_SYSTEM_NEXT_STEPS.md`

Karynth AgentOS client guide: `docs/KARYNTH_AGENTOS_CLIENT_GUIDE.md`

Karynth research catalogue: `docs/KARYNTH_AGENTOS_RESEARCH_CATALOG.md`

## Product Context

Phere is a mobile-first Indian wedding finance and planning PWA. It uses React 18 + Vite, Tailwind CSS 4, local-first storage, Supabase for optional cloud sync/auth/RLS/edge functions, and Capacitor for Android/iOS wrappers.

Read these first when context matters:

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `DEPLOYMENT_GUIDE.md`
- `docs/android-apk-qa-tracker.md` for APK/mobile wrapper state

## Core 9 Agents

| Agent | Responsibility |
|---|---|
| Command Director (`orchestrator`) | Scope work, assign agents, protect write boundaries, integrate results. |
| Strategy Planner (`planner`) | Roadmaps, sprint plans, milestones, acceptance criteria. |
| Product Strategist (`product`) | User value, family/wedding workflow fit, copy, feature tradeoffs. |
| Experience Engineer (`frontend`) | React UI, mobile UX, accessibility basics, visual polish, state wiring. |
| Systems Engineer (`backend`) | Service helpers, edge function contracts, integrations, API boundaries. |
| Data Architect (`database`) | Supabase/Postgres schema, migrations, RLS, data safety. |
| Quality Sentinel (`tester`) | Tests, regression passes, QA checklists, repro steps. |
| Release Commander (`production`) | Release readiness, builds, env review, rollback, deployment gates. |
| Trust Guardian (`security`) | Auth, secrets, RLS, privacy, public routes, destructive actions. |

## Enterprise Specialist Agents

Use these only when the work needs deeper review:

- `architect` for cross-module design, refactors, scaling, and maintainability.
- `performance` for bundle size, slow screens, charts, exports, large lists.
- `observability` for logs, monitoring, diagnostics, incidents.
- `mobile` for Capacitor, APK, Android/iOS wrapper, WebView, downloads.
- `accessibility` for keyboard flow, focus, labels, contrast, forms, modals.
- `documentation` for system docs, onboarding, release notes, handoffs.
- `data-ai` for AI/OCR prompts, parsing confidence, data-minimizing model flows.

## Optional Business Agents

These agents do **not** run automatically during coding.

They run only when coding is verified or when the user explicitly asks:

- `marketing`
- `sales`
- `customer-success`
- `support`
- `finance-strategy`
- `legal-compliance`

Business agents must not claim unbuilt features. `legal-compliance` only flags issues and drafts review material; final legal review belongs to a qualified human.

## Operating Rules

- Start with `orchestrator` for broad, risky, or ambiguous work.
- No agent may present a claim as fact unless it has evidence from repo files, command output, user context, or a stated assumption.
- When sources conflict, call it out. Example: dependency versions should come from `package.json` or lockfiles, even if docs/badges say something older.
- Do not say "tests passed", "deployed", "production-ready", "secure", "enterprise-ready", or "shipped" without direct evidence.
- Use one specialist for narrow work; use several only when the work naturally splits.
- Assign one write owner per file whenever possible.
- Do not deploy, push migrations to production, rotate secrets, delete data, or run destructive actions without explicit human approval.
- Protect user changes. Check `git status --short` before edits and do not revert unrelated work.
- For Supabase/database/auth/RLS work, use the repo Supabase skill and include `database` plus `security`.
- Every feature change needs `tester` review.
- Every production change needs `production` plus `security`.
- Keep app behavior local-first and backward-compatible with existing stored data.
- New data fields must be additive unless a migration plan exists.

## Local Commands

```bash
npm run agents:list
npm run agents:list -- business
npm run agents:brief -- architect "Split Dashboard safely"
npm run agents:route -- "Add family role permissions with RLS"
npm run agents:workflow -- release
npm run agents:gate -- release
npm run agents:truth
npm run agents:codex -- "Improve Saman performance"
npm run agents:start -- "Improve Saman performance"
npm run agents:status
npm run agents:activity
npm run agents:activity -- frontend
npm run agents:flow
npm run agents:eta
npm run agents:handoff -- "Saman performance and mobile verification"
npm run agents:handoff-next
npm run agents:handoff-status
npm run agents:handoff-done -- frontend "Saman UI reviewed"
npm run agents:run -- "Saman performance and mobile verification"
npm run agents:logs
npm run agents:stop
npm run agents:update -- "frontend inspecting Saman screen"
npm run agents:update -- frontend "checking Saman mobile layout"
npm run agents:done -- "QA plan prepared"
npm run agentos:list
npm run agentos:research
npm run agentos:adapter
npm run agentos:plan -- "Improve Saman performance"
npm run agentos:start -- "Improve Saman performance"
npm run agentos:status
npm run agentos:update -- frontend "checking Saman mobile layout"
npm run agentos:done -- "QA plan prepared"
npm run brain:list
npm run brain:search -- "NotebookLM research"
npm run brain:add -- "User prefers Hinglish for normal answers." --category writing_style --tag hinglish
npm run brain:approve -- <memory-id>
npm run brain:forget -- <memory-id>
```

Live status files are written under `.agents/status/` and are intentionally local/ignored.

Karynth AgentOS run ledgers are written under `.agents/runs/` and are intentionally local/ignored. The project profile lives in `agentos.project.json`. The default AgentOS runtime is `local`; `AGENTOS_RUNTIME=voltagent` enables the optional VoltAgent adapter, but paid model providers remain blocked unless `AGENTOS_ALLOW_PAID_MODELS=true` and the user explicitly approves the cost.

Brain memories are written under `.data/brain-memory.json` when local JSON fallback is used and are intentionally local/ignored. Brain has `user`, `project`, and `run` scopes. Project/workflow/decision memories require approval by default before they are used as long-term context. Brain must reject secrets, OTPs, customer data, payment data, and identity documents.

Phase 1 current-Codex handoff queue files are written under `.agents/handoff/` and are intentionally local/ignored. This is a free/manual flow: `agents:handoff` creates per-agent prompt files, `agents:handoff-next` prints the next prompt, the already-open Codex app performs the work after the user pastes the prompt, and `agents:handoff-done` marks that agent complete. It does not directly control Codex desktop and does not use paid API workers.

Single-Codex autonomous mode is different: the already-open Codex session itself acts as the selected agents in sequence. It may use `agents:codex` for routing/checklist context, then continues to inspect, edit, test, review, and hand off in one run. It still cannot deploy, run production SQL, rotate secrets, delete data, or perform destructive git operations without explicit human approval.

Future free AI-code-writing workers should follow `.agents/skills/phere-9-agent-manager/references/PHERE_FREE_LOCAL_AI_WORKER_PLAN.md`. Do not use paid API workers unless the user explicitly asks.

Primary verification commands:

```bash
npm run test
npm run build
npm run cap:build
```

Use `npm run cap:build` only when web changes must be synced into Capacitor wrappers.

## Done Definition

A task is done when:

- The relevant agent role has named expected behavior.
- Code or docs are changed in the smallest reasonable scope.
- Tests/build/checklists match risk.
- Security and production gates are satisfied when release-impacting.
- The final handoff says what changed, what was verified, and what risk remains.
- The final handoff says what was not verified, any source conflicts, and any assumptions.
