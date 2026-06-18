# Karynth AgentOS Client Guide

Karynth AgentOS by NexusOps is a developer-side agent operating layer for coordinating Codex-style engineering work across repositories. In this repo it runs as a backward-compatible layer over the Phere 9-Agent Manager.

## What It Does

- Routes a task to named agents with clear responsibilities.
- Keeps internal agent IDs stable while exposing client-friendly role names.
- Creates local run ledgers under `.agents/runs/`.
- Records selected agents, work units, approvals, evidence, warnings, and residual risk.
- Keeps local Brain memory separated into user, project, and run scopes.
- Supports a default local runtime and an optional VoltAgent adapter.
- Keeps paid model providers disabled by default.
- Uses NotebookLM only as a research accelerator after authentication is valid.

## Agent Names

| Client-facing name | Internal ID | Role |
|---|---|---|
| Command Director | `orchestrator` | Scope work, assign agents, protect write boundaries, integrate results. |
| Strategy Planner | `planner` | Roadmaps, milestones, acceptance criteria, sequencing. |
| Product Strategist | `product` | User value, workflow fit, copy, feature tradeoffs. |
| Experience Engineer | `frontend` | React UI, mobile UX, accessibility basics, visual polish. |
| Systems Engineer | `backend` | Service helpers, integrations, edge function contracts, API boundaries. |
| Data Architect | `database` | Supabase/Postgres schema, migrations, RLS, data safety. |
| Quality Sentinel | `tester` | Tests, regression passes, QA checklists, repro steps. |
| Release Commander | `production` | Builds, release readiness, env review, rollback gates. |
| Trust Guardian | `security` | Auth, secrets, RLS, privacy, public routes, destructive actions. |
| Solution Architect | `architect` | Cross-module design, refactors, scaling, maintainability. |
| Performance Analyst | `performance` | Bundle size, slow screens, charts, exports, large lists. |
| Telemetry Engineer | `observability` | Logs, monitoring, diagnostics, incidents. |
| Mobile Systems Specialist | `mobile` | Capacitor, APK, Android/iOS wrappers, WebView, downloads. |
| Accessibility Advocate | `accessibility` | Keyboard flow, focus, labels, contrast, forms, modals. |
| Knowledge Curator | `documentation` | System docs, onboarding, release notes, handoffs. |
| AI Data Specialist | `data-ai` | AI/OCR prompts, parsing confidence, data-minimizing model flows. |

Business agents are gated and run only after engineering is verified or when explicitly requested.

## Commands

```bash
npm run agentos:list
npm run agentos:research
npm run agentos:adapter
npm run agentos:plan -- "Improve Saman performance"
npm run agentos:start -- "Improve Saman performance"
npm run agentos:status
npm run agentos:update -- <run-id> frontend "UI review started"
npm run agentos:done -- <run-id> "Verified route and handoff evidence"
```

The existing Phere commands remain available:

```bash
npm run agents:list
npm run agents:codex -- "Improve Saman performance"
```

## Runtime Policy

Default runtime is local:

```bash
AGENTOS_RUNTIME=local
AGENTOS_ALLOW_PAID_MODELS=false
```

VoltAgent is optional:

```bash
AGENTOS_RUNTIME=voltagent
AGENTOS_ALLOW_PAID_MODELS=false
```

Even in VoltAgent mode, paid model providers stay blocked unless the user explicitly changes the config and approves the cost.

## Brain Memory

Brain memory is local-first. In local development it stores JSON under `.data/brain-memory.json`, which is ignored by git.

```bash
npm run brain:list
npm run brain:search -- "Karynth AgentOS"
npm run brain:add -- "Use NotebookLM as a research accelerator, then verify local files." --category workflow --scope project --tag notebooklm
npm run brain:approve -- <memory-id>
```

Memory scopes:

| Scope | Use |
|---|---|
| `user` | Personal preferences such as answer language, writing style, and UI taste. |
| `project` | Long-term project decisions, workflow rules, Karynth/Phere context, and approved research practices. |
| `run` | Temporary run-specific context tied to an AgentOS run id. |

Project/workflow/decision memories require approval by default before they are used as long-term context.

## Boundaries

Karynth AgentOS is not a claim that Phere is deployed, enterprise-certified, secure, or production-ready. Those words require direct evidence from files, command output, deployment/admin sources, or explicit human approval.

The system does not:

- Deploy to production.
- Run production SQL.
- Rotate secrets.
- Delete data.
- Run destructive git commands.
- Spawn hidden paid workers.
- Treat NotebookLM summaries as final implementation truth.

## Demo Script

1. Show the agent roster with `npm run agentos:list`.
2. Show the research catalogue with `npm run agentos:research`.
3. Create a run ledger with `npm run agentos:plan -- "Improve Saman performance"`.
4. Open the generated `.agents/runs/<run-id>/KARYNTH_AGENT_RUN.md`.
5. Explain the selected agents, work units, zero-cost guardrail, and approval gates.
6. Run `npm run agents:codex -- "Improve Saman performance"` to show backward compatibility.
