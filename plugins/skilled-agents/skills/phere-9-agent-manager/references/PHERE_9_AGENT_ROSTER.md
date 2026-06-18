# Phere 9-Agent Manager Roster

The core team has 9 agents. Enterprise mode adds specialist agents for heavy projects and optional business agents that run only after engineering work is complete or when explicitly requested.

## Core Engineering Team

| Agent | Runs when | Owns | Must hand off |
|---|---|---|---|
| `orchestrator` | Any broad, risky, or multi-file task | Scope, routing, write ownership, integration | Plan, owner map, validation summary |
| `planner` | Roadmaps, milestones, unclear feature scope | Sequencing, acceptance criteria, dependencies | Task list with done criteria |
| `product` | User flow, copy, feature value, UX tradeoffs | Phere domain fit, family workflows, simplicity | User outcome and edge cases |
| `frontend` | React, UI, state wiring, layout | Pages, components, forms, mobile UX | Files changed, UI states, build result |
| `backend` | Service helpers, edge calls, integrations | Client integration boundaries, retries, contracts | Contract notes and failure behavior |
| `database` | Supabase/Postgres, RLS, migrations | Schema, data compatibility, query safety | Migration risk, RLS review, rollback notes |
| `tester` | Any code change or release candidate | Tests, repros, QA checklist, edge cases | Checks run and residual risk |
| `production` | Build, deploy, env, Capacitor, release | Release gate, rollback, smoke tests | Approval boundary and deploy readiness |
| `security` | Auth, secrets, RLS, exports, delete, public routes | Privacy, roles, sensitive data exposure | Risk rating and required fixes |

## Enterprise Specialist Agents

These agents are not always active. The orchestrator activates them when the task is large, high-risk, cross-module, or needs enterprise-style discipline.

| Agent | Runs when | Owns | Boundary |
|---|---|---|---|
| `architect` | Cross-module design, refactors, scaling decisions | System design, module boundaries, ADR-style tradeoffs | Advisory unless assigned code files |
| `performance` | Slow UI, large lists, bundle growth, expensive exports | Render cost, bundle split, memoization, data volume | Must prove impact with checks or estimates |
| `observability` | Production debugging, logs, monitoring, failure visibility | Logging strategy, health checks, useful diagnostics | No sensitive user data in logs |
| `mobile` | Capacitor, APK, WebView, viewport, downloads | Android/iOS wrapper behavior and mobile QA | Must preserve web PWA behavior |
| `accessibility` | Forms, navigation, modals, dense tables | Keyboard flow, labels, focus, contrast, touch targets | Pairs with frontend for UI changes |
| `documentation` | New systems, APIs, release notes, onboarding | Docs that help future agents and humans | No doc churn unrelated to task |
| `data-ai` | AI/OCR prompts, parsing, training data, analytics | Prompt contracts, confidence, sensitive-data minimization | Pairs with security for user data |

## Optional Business Agents

These agents are gated. They do not run during coding unless the user explicitly asks.

| Agent | Runs only when | Owns | Output |
|---|---|---|---|
| `marketing` | Code is done, or user asks for launch/marketing | Positioning, landing copy, launch plan | Campaign plan or copy |
| `sales` | Code is done, or user asks for selling/pricing | ICP, pitch, sales script, objections | Sales playbook |
| `customer-success` | Code is done, or user asks for onboarding/retention | User activation, onboarding, feedback loops | Success checklist |
| `support` | Code is done, or user asks for help center/support | FAQ, issue triage, bug intake | Support docs |
| `finance-strategy` | User asks for pricing, costs, runway, monetization | Pricing model and cost assumptions | Finance memo |
| `legal-compliance` | User asks for policy, privacy, terms, compliance | Compliance checklist and legal review flags | Drafts for human/legal review |

## Activation Rules

- Core agents can run during implementation.
- Enterprise specialist agents run when risk or scale demands them.
- Optional business agents run after engineering verification or explicit user request.
- Business agents may inspect product behavior but must not change code unless the user asks for code-level marketing/sales surfaces.
- `legal-compliance` is not a lawyer. It flags issues and drafts checklists; final legal review belongs to a qualified human.

## Read-First Map

- Product context: `README.md`, `docs/ROADMAP.md`
- Architecture: `docs/ARCHITECTURE.md`
- Deployment: `DEPLOYMENT_GUIDE.md`
- Mobile/APK: `docs/android-apk-qa-tracker.md`
- Agent system: `AGENTS.md`, `docs/PHERE_9_AGENT_MANAGER_SYSTEM.md`
