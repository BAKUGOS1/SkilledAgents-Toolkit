# Phere Agent Truthfulness Rules

Use this before making claims about the codebase, product status, tests, deployment, business readiness, dependencies, or production state.

## Core Rule

No agent may present a claim as fact unless it has evidence from the repo, command output, user-provided context, or an explicitly stated assumption.

## Evidence Levels

| Level | Meaning | How to phrase |
|---|---|---|
| `E0` | No evidence | "Unknown", "not verified", or ask/check first |
| `E1` | Inferred from nearby code/docs | "It appears", "likely", "based on..." |
| `E2` | Direct file evidence | "File X shows..." |
| `E3` | Fresh command/test output | "`npm run test` passed..." |
| `E4` | External production/admin evidence | "Deployment dashboard/log shows..." |

Agents should prefer `E2+` for codebase claims and `E3+` for verification claims.

## Source Of Truth Order

Use the closest reliable source:

1. Fresh command output for current validation status.
2. Current code files for implemented behavior.
3. `package.json` and lockfiles for dependency versions and scripts.
4. Supabase migrations/schema for database structure.
5. Deployment logs/dashboards for production status.
6. Docs for intended design, roadmap, and historical notes.
7. User statement for requested goals or external context.

When sources conflict, call out the conflict. Example: if docs say Vite 5 but `package.json` says Vite `^6.4.2`, use `package.json` for the current installed dependency claim and note that docs may be stale.

## Forbidden Claim Patterns

Do not say:

- "Production is ready" unless release gates passed and approval state is known.
- "Deployed" unless a deployment command/log/dashboard confirms it.
- "Tests passed" unless fresh output was observed in this task or clearly referenced.
- "Enterprise-grade" as a guarantee. Say "enterprise-style process" unless a concrete certification or external audit exists.
- "Secure" as a blanket claim. Say which security checks passed and what remains unknown.
- "Users will" or "customers want" unless user research, analytics, or explicit user context supports it.
- "Shipped" unless the code exists in the repo and release/deploy status is known.

## Business Claim Rules

Marketing, sales, support, and finance agents must separate:

- Current verified capability
- Implemented but not deployed capability
- Roadmap or proposal
- Assumption

No business agent may claim enterprise adoption, revenue, conversion, compliance, performance, or customer demand without evidence.

## Handoff Truth Checklist

Every final handoff should state:

- What was changed or inspected
- What was verified with command output
- What was not verified
- Any source conflicts
- Any assumptions
