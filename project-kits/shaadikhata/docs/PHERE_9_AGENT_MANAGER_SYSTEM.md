# Phere 9-Agent Manager System

This is a developer-side app management system for Phere. It does not run inside the user app yet. It trains Codex-style assistants to follow an enterprise-style engineering process while working in this repo.

## System Name

**Phere 9-Agent Manager**

The name refers to the core 9 engineering agents. Enterprise mode adds specialist agents and optional post-code business agents.

Reusable multi-project layer: **Karynth AgentOS by NexusOps**. Karynth keeps this repo's Phere commands intact while adding client-facing agent names, `agentos.project.json`, `agentos:*` commands, a complete external-repo research catalogue, and local run ledgers under `.agents/runs/`.

## Agent Layers

| Layer | Agents | When used |
|---|---|---|
| Core engineering | `orchestrator`, `planner`, `product`, `frontend`, `backend`, `database`, `tester`, `production`, `security` | Default app planning, coding, QA, release, and safety work |
| Enterprise specialists | `architect`, `performance`, `observability`, `mobile`, `accessibility`, `documentation`, `data-ai` | Large, risky, cross-module, production-grade, or maintainability-heavy work |
| Optional business | `marketing`, `sales`, `customer-success`, `support`, `finance-strategy`, `legal-compliance` | Only after code is done, or when the user explicitly asks |

Karynth client-facing names always include the internal ID, for example **Command Director (`orchestrator`)**, **Quality Sentinel (`tester`)**, and **Trust Guardian (`security`)**.

## Deep Training Files

| File | Purpose |
|---|---|
| `.agents/skills/phere-9-agent-manager/references/PHERE_9_AGENT_ROSTER.md` | Role cards for all agents |
| `.agents/skills/phere-9-agent-manager/references/PHERE_AGENT_ROUTING_ALGORITHM.md` | Agent selection algorithm |
| `.agents/skills/phere-9-agent-manager/references/PHERE_ENTERPRISE_AGENT_OPERATING_MODEL.md` | Heavy-project execution model |
| `.agents/skills/phere-9-agent-manager/references/PHERE_AGENT_TRUTHFULNESS_RULES.md` | Evidence and no-false-claims rules |
| `.agents/skills/phere-9-agent-manager/references/PHERE_AGENT_QUALITY_CONTRACTS.md` | Done definitions and quality gates |
| `.agents/skills/phere-9-agent-manager/references/PHERE_PRODUCTION_SECURITY_GATES.md` | Release, Supabase, and security gates |
| `.agents/skills/phere-9-agent-manager/references/PHERE_OPTIONAL_BUSINESS_AGENTS.md` | Marketing/sales/support activation rules |
| `.agents/skills/phere-9-agent-manager/references/PHERE_CODEX_HANDOFF_QUEUE_PLAN.md` | Phase 1 current-Codex handoff queue rules |
| `.agents/skills/phere-9-agent-manager/references/PHERE_FREE_LOCAL_AI_WORKER_PLAN.md` | Future free Ollama/local LLM worker plan |
| `docs/PHERE_AGENT_SYSTEM_NEXT_STEPS.md` | Current GitHub research summary and next implementation phases |

## Single-Codex Autonomous Mode

This is the Codex-only mode the user can request when they want one already-open Codex session to carry the task through the agent process without manual prompt handoff.

Use:

```bash
npm run agents:codex -- "task"
```

The command prints the selected agents, risk, execution order, verification gates, and approval boundaries. Codex should then continue the work in the same session: orchestrator first, then relevant planner/product/implementation agents, then tester/security/production gates, then a truth-checked final handoff.

This mode is more autonomous than `agents:handoff`, because Codex does not wait for the user to paste each per-agent prompt. It is still not a hidden background LLM worker: it does not call paid API workers, does not secretly edit outside the current Codex run, and does not bypass approval for deploys, production SQL, secret rotation, data deletion, or destructive git operations.

## Routing Algorithm Summary

1. Classify the work: plan, feature, bug, refactor, database, release, incident, docs, or business.
2. Check truth requirements and identify claims that need evidence.
3. Assign risk from `R0` to `R4`.
4. Select mandatory core agents.
5. Add enterprise specialists only when the work needs them.
6. Park business agents unless coding is done or the user explicitly asks.
7. Assign write scopes before editing.
8. Define verification before implementation.
9. Run security/production/truth gates for high-risk work.
10. Handoff with changed files, checks, decisions, source conflicts, assumptions, and residual risk.

## Truthfulness Rule

Agents must separate facts, assumptions, recommendations, and unknowns. They must not say tests passed, production is ready, a feature is shipped, the app is secure, or the product is enterprise-ready without direct evidence.

If sources conflict, the agent must say so. Example found during re-analysis: existing docs mention Vite 5.x, while `package.json` currently lists Vite `^6.4.2`; dependency-version claims should use `package.json` as the closer runtime source.

## Business-Agent Rule

Marketing, sales, support, customer-success, finance-strategy, and legal-compliance are gated. They do not interrupt coding work. They run after implementation and verification, or when the user explicitly asks for business planning.

They must not claim features that are not built. Legal/compliance output is a review draft, not final legal advice.

## CLI

```bash
npm run agents:list
npm run agents:list -- enterprise
npm run agents:list -- business
npm run agents:brief -- security "Review public RSVP data exposure"
npm run agents:route -- "Add family role permissions with RLS"
npm run agents:workflow -- database
npm run agents:gate -- release
npm run agents:truth
npm run agents:codex -- "Improve Saman performance"
npm run agents:start -- "Improve Saman performance"
npm run agents:status
npm run agents:activity
npm run agents:activity -- performance
npm run agents:flow
npm run agents:eta
npm run agents:handoff -- "Saman performance and mobile verification"
npm run agents:handoff-next
npm run agents:handoff-status
npm run agents:handoff-done -- frontend "Saman UI reviewed"
npm run agents:run -- "Saman performance and mobile verification"
npm run agents:logs
npm run agents:stop
npm run agents:update -- "performance reviewing large Saman lists"
npm run agents:update -- performance "checking list rendering and bundle risk"
npm run agents:done -- "verification checklist ready"
npm run agentos:list
npm run agentos:research
npm run agentos:plan -- "Improve Saman performance"
npm run agentos:start -- "Improve Saman performance"
npm run agentos:status
npm run agentos:update -- frontend "checking Saman mobile layout"
npm run agentos:done -- "verification checklist ready"
```

Live status is stored locally in `.agents/status/PHERE_9_AGENT_LIVE_STATUS.json` and `.agents/status/PHERE_9_AGENT_LIVE_STATUS.md`. Background runner logs go to `.agents/status/PHERE_9_AGENT_WORKER.log`. These files are runtime status artifacts, not product code.

Phase 1 current-Codex handoff queue is documented in `docs/PHERE_CODEX_HANDOFF_QUEUE.md`. It writes per-agent prompt files under `.agents/handoff/`, then the user pastes the next prompt into the already-open Codex app. This keeps the flow free and visible. It does not directly control Codex desktop and does not call paid API workers.

Single-Codex autonomous mode uses the same already-open Codex app differently: Codex acts through the selected agents inside one session. It may use `agents:codex` for the role contract, then continues through implementation and verification itself.

`agents:run` is a safe deterministic background runner. It can route work, update agent status, inspect files, run tests/build, and write logs. It does not secretly edit code, deploy, change production data, or call an LLM.

For future free AI-code-writing workers, follow `.agents/skills/phere-9-agent-manager/references/PHERE_FREE_LOCAL_AI_WORKER_PLAN.md`. The planned route is Ollama/local coding models, proposed patches saved for review, and human approval before applying changes.

Karynth AgentOS defaults to the local runtime. The optional VoltAgent adapter is selected only with `AGENTOS_RUNTIME=voltagent`. Paid model providers remain blocked by default through `AGENTOS_ALLOW_PAID_MODELS=false`.

## Brain Memory Governance

Brain memory is local-first and uses `.data/brain-memory.json` when Mem0 is not configured. `.data/` stays ignored.

Scopes:

- `user` for personal preferences and writing/design style.
- `project` for Phere/Karynth workflow rules, decisions, and approved research context.
- `run` for temporary AgentOS run context.

Project, workflow, decision, and skill-rule memories require approval by default before they are used as long-term project context. Use:

```bash
npm run brain:list
npm run brain:list -- --all
npm run brain:search -- "Karynth AgentOS"
npm run brain:approve -- <memory-id>
npm run brain:forget -- <memory-id>
```

Brain must reject secrets, OTPs, customer data, payment data, identity documents, and exact personal addresses.

## Enterprise Done Definition

Work is complete when:

- The user outcome is clear.
- Ownership and write scopes are respected.
- Implementation follows existing repo patterns.
- Tests/build/manual QA match the risk level.
- Security and production gates are closed when relevant.
- Business agents, if used, only describe shipped or explicitly planned capabilities.
- Claims are backed by evidence or clearly labeled as assumptions/unknowns.
