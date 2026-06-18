# Phere 9-Agent Manager Workflows

## Universal Intake

1. `orchestrator` names the task type: plan, feature, bug, refactor, database, release, incident, docs, or business.
2. `orchestrator` assigns risk:
   - `R0`: docs-only or read-only.
   - `R1`: narrow code change with local behavior.
   - `R2`: user-facing feature or shared helper.
   - `R3`: auth, data, Supabase, export, mobile wrapper, or production path.
   - `R4`: destructive operation, production SQL, deploy, secret rotation, incident.
3. `orchestrator` selects required agents from the routing algorithm.
4. Every write agent gets a file/module ownership boundary.
5. `tester` defines verification before implementation starts for `R1+`.
6. `security` joins for `R3+` and all auth/data/secret/export/delete work.
7. `production` joins for `R3+` when release, build, env, migration, or deployability is affected.

## Feature Workflow

Required agents:

- `orchestrator`
- `planner`
- `product`
- One or more implementation agents
- `tester`

Add as needed:

- `architect` for cross-module features
- `database` and `security` for data/auth/RLS
- `performance` for heavy lists, charts, reports, imports, exports
- `mobile` for Capacitor/APK/WebView behavior
- `production` for env, migrations, functions, deployment

Done when:

- Acceptance criteria are satisfied.
- Local-first behavior is preserved.
- Tests/build match risk.
- Security/production gates are closed when applicable.

## Bug Workflow

1. `tester` captures repro, expected behavior, and affected surfaces.
2. `orchestrator` assigns one primary owner.
3. Owner fixes smallest safe scope.
4. `tester` reruns targeted checks.
5. `security` joins if the bug affects data exposure, auth, delete, public routes, or payments/finance totals.

## Refactor Workflow

Required agents:

- `architect`
- Owning implementation agent
- `tester`

Rules:

- No behavior change unless explicitly stated.
- Refactor must reduce complexity, duplication, risk, or future cost.
- Large files should be split behind existing interfaces first.
- Add characterization tests when behavior is hard to see.

## Database Workflow

Required agents:

- `database`
- `security`
- `tester`
- `production` for production-bound migration

Rules:

- Use Supabase guidance before schema, RLS, auth, or edge function work.
- Prefer additive migrations.
- Migrations should be idempotent where practical.
- Include rollback risk and data compatibility notes.
- No production SQL without explicit human approval.

## Release Workflow

Required agents:

- `production`
- `tester`
- `security`
- `orchestrator`

Minimum gate:

- `npm run test`
- `npm run build`
- Env review
- Migration/function review if touched
- Rollback path
- Smoke test plan
- Human approval before deploy

## Business Workflow

Business agents run only when coding is done or the user explicitly requests business work.

Sequence:

1. `orchestrator` confirms engineering status.
2. `product` summarizes verified current capability and clearly separates roadmap items.
3. Requested business agent creates the deliverable.
4. `legal-compliance` joins for claims, privacy, terms, or regulated language.
5. Business output must state assumptions and avoid claiming unverified features as current capability.
