# Phere Agent Routing Algorithm

Use this algorithm for large, ambiguous, enterprise-style, or high-risk work.

## Router Inputs

- User request
- Current git state
- Files likely affected
- Runtime surface: web, Supabase, mobile, docs, release, business
- Risk class: `R0` to `R4`
- Whether code is already done
- Whether the user explicitly requested business work
- Evidence level available for important claims

## Algorithm

```text
1. Normalize request.
2. Check truth requirements:
   - identify claims that need evidence
   - inspect closest source of truth before repeating facts
   - mark unknowns as unknown
3. Classify work type:
   docs | plan | feature | bug | refactor | database | release | incident | business
4. Estimate risk:
   R0 docs/read-only
   R1 narrow local code
   R2 user-facing/shared logic
   R3 auth/data/release/mobile
   R4 destructive/production/secret/incident
5. Select mandatory agents:
   Always broad -> orchestrator
   plan -> planner
   user flow -> product
   UI -> frontend
   services/functions -> backend
   Supabase/Postgres/RLS -> database + security
   code change -> tester
   deploy/build/env/mobile release -> production
   auth/secrets/public/export/delete -> security
6. Add enterprise specialists:
   cross-module or architecture -> architect
   slow/heavy/bundle/list/export -> performance
   logs/monitoring/failure visibility -> observability
   Capacitor/APK/WebView -> mobile
   keyboard/contrast/forms -> accessibility
   docs/onboarding/system changes -> documentation
   AI/OCR/prompt/data quality -> data-ai + security
7. Gate business agents:
   if user explicitly asks marketing/sales/support/pricing/legal:
      allow requested business agent
   else if code_done and launch/business phase requested:
      allow relevant business agent
   else:
      block business agents and continue engineering
8. Assign write scopes.
9. Define verification before editing.
10. Execute and integrate.
11. Handoff with files, checks, risks, source conflicts, assumptions, and next allowed phase.
```

## Routing Examples

| Request | Agents |
|---|---|
| "Fix dashboard total mismatch" | `orchestrator`, `tester`, `frontend`, maybe `backend`, `security` if user data exposure |
| "Add family role permissions" | `orchestrator`, `planner`, `product`, `frontend`, `database`, `security`, `tester`, `production` |
| "Split Expenses.jsx safely" | `orchestrator`, `architect`, `frontend`, `tester`, `performance` |
| "Prepare production deploy" | `orchestrator`, `production`, `tester`, `security`, `database` if migrations exist |
| "Create launch plan after feature is complete" | `orchestrator`, `product`, `marketing`, maybe `sales` |

## Conflict Rules

- One write owner per file whenever possible.
- If two agents need the same file, `orchestrator` serializes edits.
- `security`, `production`, and `tester` can do read-only review in parallel.
- Business agents do not edit engineering files during implementation.
- If facts are uncertain, route through `documentation` or the relevant owner for evidence gathering before acting.
