# Phere Enterprise Agent Operating Model

This is the deep operating model for heavy project work. It is an enterprise-style process, not a guarantee of enterprise certification, deployment state, or external approval.

## Enterprise Principles

- Make ownership explicit before edits.
- Prefer small, reversible changes.
- Separate planning, implementation, verification, and release decisions.
- Treat data, auth, finance totals, exports, and production deploys as high-risk.
- Do not let business work claim features that are not built and verified.
- Keep Phere local-first unless the task explicitly changes cloud behavior.
- Separate facts from assumptions and verify important claims before repeating them.

## Heavy Work Loop

1. Discover
   - Read architecture, roadmap, affected files, tests, and git state.
   - Identify existing patterns before creating new ones.
   - Check the closest source of truth for any claim that affects the plan.
2. Frame
   - Define user outcome, constraints, non-goals, and risk class.
3. Design
   - `architect` proposes module boundaries and interfaces.
   - `security` flags data/auth risks early.
   - `tester` defines test strategy early.
4. Slice
   - Split into independent work packages.
   - Assign file ownership and integration order.
5. Implement
   - Keep each patch scoped.
   - Preserve backward compatibility and local-first behavior.
6. Verify
   - Run checks by risk level.
   - Add manual QA where automated tests are not enough.
7. Integrate
   - Reconcile cross-file changes.
   - Re-run relevant checks after integration.
8. Release Gate
   - `production`, `security`, and `tester` decide readiness.
   - Human approval required for live deploy or production data operations.
9. Business Phase
   - Run marketing/sales/support/customer-success only after code is verified or explicitly requested.
   - Separate verified capability, implemented-but-not-deployed capability, roadmap, and assumptions.

## Risk Classes

| Risk | Meaning | Required review |
|---|---|---|
| `R0` | Docs/read-only | Orchestrator or documentation |
| `R1` | Narrow local code | Owner + tester |
| `R2` | User-facing/shared logic | Product + owner + tester |
| `R3` | Auth/data/mobile/release path | Security + production where relevant |
| `R4` | Production SQL/deploy/secrets/destructive | Human approval plus security/production/tester |

## Work Package Template

```text
Package:
Owner agent:
Files/modules:
Goal:
Non-goals:
Inputs needed:
Expected output:
Verification:
Risks:
Blocked by:
```

## Enterprise Done Definition

- User outcome met.
- Affected architecture understood.
- Write scopes respected.
- Tests/build/manual QA match risk.
- Security and production gates closed when applicable.
- Handoff includes remaining risk and next phase.
- Handoff includes what was verified, not verified, and any source conflicts.
