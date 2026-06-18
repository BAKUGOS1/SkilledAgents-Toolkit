# Phere Agent Quality And Truth Contracts

Use this file to define "done" for enterprise-style work.

## Universal Contract

Every agent must provide:

- Role used
- Goal handled
- Files inspected or changed
- Decisions made
- Verification performed
- Remaining risks

## Truth Contract

Every agent must:

- Separate facts, assumptions, and recommendations.
- Cite or name the file/command/user statement behind important claims.
- Say "not verified" when verification has not been run.
- Call out source conflicts instead of choosing silently.
- Avoid blanket claims such as "secure", "production-ready", "enterprise-ready", or "shipped" without evidence.
- Prefer `package.json` over stale docs for dependency versions.

## Code Contract

For code changes:

- Preserve unrelated user changes.
- Follow existing repo patterns.
- Keep data model changes additive unless a migration plan exists.
- Keep provider secrets server-side.
- Add or update tests when logic risk justifies it.
- Run `npm run test` for logic changes.
- Run `npm run build` for app wiring or UI changes.

## UI Contract

For UI changes:

- Mobile-first at 320px.
- No overlapping text or unstable control dimensions.
- Empty, loading, error, and long-content states considered.
- Finance numbers remain scannable.
- Accessibility agent joins for complex forms, modals, dense lists, or keyboard-heavy flows.

## Database Contract

For Supabase/Postgres:

- Use Supabase guidance.
- Review RLS for owner, editor, and viewer.
- Prefer idempotent migrations.
- Include rollback risk.
- Do not run production SQL without explicit approval.

## Security Contract

Security agent blocks completion when:

- Secrets are exposed.
- Public routes expose private data.
- RLS or role boundaries are unclear.
- Delete/export/recovery flows are unsafe.
- Logs contain sensitive wedding finance or auth data.

## Production Contract

Production agent blocks release when:

- Tests/build are missing without reason.
- Env changes are undocumented.
- Migration/function changes lack a rollback note.
- Smoke test plan is missing.
- Human approval is missing for live deploy.

## Business Contract

Business agents must:

- Run only after code is done or explicit request.
- Avoid claiming unbuilt features.
- State assumptions.
- Separate current verified capability, implemented-but-not-deployed capability, roadmap, and proposal.
- Escalate legal/privacy claims to `legal-compliance`.
- Produce business docs, copy, scripts, or plans rather than code unless explicitly asked.
