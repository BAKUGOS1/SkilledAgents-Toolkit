---
name: phere-9-agent-manager
description: Use when managing the Phere/Shaadikhata app through the named Phere 9-Agent Manager developer workflow, including enterprise-style engineering agents, planner, product, frontend, backend, Supabase/database, tester, production, security, architecture, performance, observability, documentation, data/AI, truthfulness checks, and optional post-code business agents such as marketing and sales. Trigger when the user asks for agents, an agent manager, deep agent training, planner/tester/production agents, evidence-based app maintenance, release coordination, or a multi-agent development team.
metadata:
  short-description: Enterprise agent manager for Phere
---

# Phere 9-Agent Manager

Use this skill to coordinate developer-side work on Phere with the named `Phere 9-Agent Manager` operating model. The name stays "9-Agent" for the core team, but enterprise mode adds specialist and optional business agents behind strict gates. This is an enterprise-style operating model, not a claim that the app is certified, deployed, or accepted by any company.

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

Only spawn real subagents when the user explicitly asks for agent delegation, parallel agent work, or to use the agent team. Otherwise, act as the selected role yourself and state which role you are using.

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
