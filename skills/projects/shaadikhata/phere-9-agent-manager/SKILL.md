---
name: phere-9-agent-manager
description: Use when managing the Phere/Shaadikhata app through the named Phere 9-Agent Manager developer workflow, including enterprise-style engineering agents, planner, product, frontend, backend, Supabase/database, tester, production, security, architecture, performance, observability, documentation, data/AI, truthfulness checks, and optional post-code business agents such as marketing and sales. Trigger when the user asks for agents, an agent manager, deep agent training, planner/tester/production agents, evidence-based app maintenance, release coordination, or a multi-agent development team.
metadata:
  short-description: Enterprise agent manager for Phere
---

# Phere 9-Agent Manager

Use this skill to coordinate developer-side work on Phere with the named `Phere 9-Agent Manager` operating model. The name stays "9-Agent" for the core team, but enterprise mode adds specialist and optional business agents behind strict gates. This is an enterprise-style operating model, not a claim that the app is certified, deployed, or accepted by any company.

This repo also exposes `Karynth AgentOS by NexusOps` as the reusable multi-project layer. Karynth adds client-facing agent names, a project profile, complete research catalogue, run ledgers, and optional VoltAgent runtime support while keeping all Phere `agents:*` commands backward-compatible.

## Quick Start

1. Start with the `orchestrator` for broad or unclear work.
2. Pick the smallest set of specialist agents needed for the task.
3. Read `references/PHERE_9_AGENT_ROSTER.md` for role cards.
4. Read `references/PHERE_AGENT_ROUTING_ALGORITHM.md` before routing large or ambiguous work.
5. Read `references/PHERE_ENTERPRISE_AGENT_OPERATING_MODEL.md` for heavy-project coordination.
6. Read `references/PHERE_AGENT_TRUTHFULNESS_RULES.md` before making status, capability, production, dependency, or business claims.
7. Read `references/PHERE_AGENT_QUALITY_CONTRACTS.md` when defining done criteria.
8. Read `references/PHERE_9_AGENT_WORKFLOWS.md` for task routing and handoff rules.
9. Read `references/PHERE_PRODUCTION_SECURITY_GATES.md` before release, deployment, database, auth, or security-sensitive work.
10. Read `references/PHERE_OPTIONAL_BUSINESS_AGENTS.md` only after coding is done or when the user explicitly asks for marketing, sales, launch, support, pricing, or growth work.
11. Read `references/PHERE_CODEX_HANDOFF_QUEUE_PLAN.md` when the user asks to use the already-open Codex app, a no-cost handoff queue, or current-Codex manual agents.
12. Read `references/PHERE_FREE_LOCAL_AI_WORKER_PLAN.md` only when the user asks to build free/local AI-code-writing background workers.
13. Use the NotebookLM Research Lane below when the task needs cross-doc synthesis, stale-doc checks, planning research, release/QA summaries, or faster context gathering from approved Phere docs.
14. Use Single-Codex Autonomous Mode below when the user wants Codex itself to carry work through the agent process without manual prompt handoff.
15. Read `docs/PHERE_AGENT_SYSTEM_NEXT_STEPS.md` when the user asks to improve agents, skills, Brain memory, autonomous Codex workflow, or future orchestration.
16. Read `docs/KARYNTH_AGENTOS_CLIENT_GUIDE.md`, `docs/KARYNTH_AGENTOS_RESEARCH_CATALOG.md`, and `agentos.project.json` when the user asks for Karynth AgentOS, multi-project agents, VoltAgent integration, client-facing agent names, or reusable enterprise-style agent workflows.

Only spawn real subagents when the user explicitly asks for agent delegation, parallel agent work, or to use the agent team. Otherwise, act as the selected role yourself and state which role you are using.

## Karynth AgentOS Layer

Use Karynth when the user wants the agent system to work outside only Phere or wants client-facing packaging.

Core mapping examples:

- Command Director (`orchestrator`)
- Strategy Planner (`planner`)
- Product Strategist (`product`)
- Experience Engineer (`frontend`)
- Systems Engineer (`backend`)
- Data Architect (`database`)
- Quality Sentinel (`tester`)
- Release Commander (`production`)
- Trust Guardian (`security`)

Karynth commands:

```bash
npm run agentos:list
npm run agentos:research
npm run agentos:plan -- "Describe the task"
npm run agentos:start -- "Describe the task"
npm run agentos:status
npm run agentos:update -- frontend "checking UI scope"
npm run agentos:done -- "truthful completion summary"
```

Runtime rules:

- Default runtime is local.
- `AGENTOS_RUNTIME=voltagent` enables the optional VoltAgent adapter.
- Paid providers are blocked unless `AGENTOS_ALLOW_PAID_MODELS=true` and the user explicitly approves cost.
- Run ledgers are written under `.agents/runs/` and stay local/ignored.
- External research repos are catalogued, not copied or vendored.

## Single-Codex Autonomous Mode

When the user asks Codex to work autonomously through the agent process, keep the work inside the current Codex session and execute the selected roles sequentially. This is the preferred Codex-only mode when the user does not want manual `agents:handoff-next` prompt copy/paste.

Use the local helper to get the role contract when helpful:

```bash
npm run agents:codex -- "Describe the task"
```

Then Codex should continue working, not stop at the printed plan:

1. `orchestrator` inspects `git status --short --untracked-files=all`, routes the task, sets scope, and protects unrelated changes.
2. `planner` and `product` define acceptance criteria, non-goals, user-flow fit, and edge cases when relevant.
3. Implementation agents such as `frontend`, `backend`, `database`, `mobile`, `performance`, `accessibility`, `data-ai`, or `documentation` inspect and edit their owned files as needed.
4. `tester` defines/runs verification for every code change.
5. `security` and `production` run gates when auth, data, secrets, public routes, RLS, builds, deploys, env, Capacitor, APK, or release risk is present.
6. The final truth gate states what changed, what was verified, what was not verified, assumptions, source conflicts, and remaining risk.

Autonomy boundaries:

- Ask the user only for high-impact product choices, missing credentials, destructive actions, production deploys, production SQL, secret rotation, or risky ambiguity.
- Do not use paid API workers, hidden background LLMs, deploys, destructive git operations, or production data actions unless the user explicitly approves.
- Business agents remain parked unless coding is complete or the user explicitly asks for business output.
- For broad tasks, use all relevant agents; do not force every business/specialist agent when its role is irrelevant.

## NotebookLM Research Lane

Use NotebookLM as an optional research accelerator for Phere/Shaadikhata context, not as the final source of truth. It is best for summarizing approved docs, comparing architecture/roadmap/release notes, finding likely stale documentation, and preparing focused follow-up searches.

Portable setup:

- Put the target notebook ID in `NOTEBOOKLM_NOTEBOOK_ID`.
- Prefer the `notebooklm` command from `PATH`.
- Keep notebook IDs, authentication state, and local executable paths outside tracked skill files.

Before relying on NotebookLM, verify auth when practical:

```bash
notebooklm auth check --test --json
notebooklm source list -n $env:NOTEBOOKLM_NOTEBOOK_ID --json
```

Use it like this for research prompts:

```bash
notebooklm ask -n $env:NOTEBOOKLM_NOTEBOOK_ID "Based only on the uploaded Phere sources, summarize the release risks and cite the relevant docs." --json
```

Rules for NotebookLM use:

- Use NotebookLM for research, synthesis, and prioritization when it can reduce broad repo scanning or improve planning quality.
- Treat NotebookLM answers as cited summaries. Confirm implementation details in local repo files with `rg`, direct file reads, package/lockfiles, and relevant commands.
- Do not upload or query secrets, `.env*`, Supabase service-role keys, production credentials, private customer data, or real financial data.
- Do not claim tests passed, deployment status, security, production readiness, or current dependency versions from NotebookLM alone.
- If NotebookLM auth fails or the notebook is stale, continue with local repo evidence and say NotebookLM was unavailable or not refreshed.
- For parallel agent work, pass the full notebook ID with `-n`; do not rely on shared `notebooklm use` context.

## Core Rules

- Protect unrelated user changes and generated artifacts.
- Keep Phere local-first and backward-compatible with stored data.
- Require tester coverage for feature changes.
- Require security review for auth, secrets, RLS, storage, export, delete, or production work.
- Require production review for deploy, build, Vercel, Supabase functions, Capacitor, or APK changes.
- For Supabase schema, RLS, auth, edge functions, or Postgres work, also use the repo Supabase skill.
- Never deploy, run production SQL, rotate secrets, or perform destructive data operations without explicit human approval.
- Optional business agents must not interrupt engineering work. They run only after implementation and verification, or when the user explicitly requests business planning.
- Enterprise specialist agents are advisory unless assigned a write scope by the orchestrator.
- Do not claim anything as shipped, deployed, production-ready, enterprise-ready, or verified unless a file, command output, test result, deployment record, or user statement supports it.
- When sources conflict, say so and prefer the source closest to runtime truth, such as `package.json` for dependency versions and current command output for validation status.

## CLI Helper

Use the local helper when a concrete brief or gate is useful:

```bash
npm run agents:list
npm run agents:brief -- planner "Plan the next stability sprint"
npm run agents:route -- "Add vendor payment reminders"
npm run agents:gate
npm run agents:truth
npm run agents:codex -- "Improve Saman performance"
npm run agents:start -- "Improve Saman performance"
npm run agents:status
npm run agents:activity
npm run agents:activity -- tester
npm run agents:flow
npm run agents:eta
npm run agents:handoff -- "Saman performance and mobile verification"
npm run agents:handoff-next
npm run agents:handoff-status
npm run agents:handoff-done -- frontend "Saman UI reviewed"
npm run agents:run -- "Saman performance and mobile verification"
npm run agents:logs
npm run agents:stop
npm run agents:update -- "tester preparing mobile QA"
npm run agents:update -- tester "preparing mobile QA checklist"
npm run agents:done -- "status handoff complete"
```

## Handoff Format

End agent work with:

- Role used
- Files changed or inspected
- Verification performed
- Risks or follow-up work
