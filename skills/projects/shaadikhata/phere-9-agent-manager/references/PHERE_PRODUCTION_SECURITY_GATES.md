# Phere 9-Agent Manager Production And Security Gates

Use this before release-impacting work, deploy planning, Supabase changes, Capacitor builds, or security-sensitive changes.

## Non-Negotiables

- No live deploy without explicit human approval.
- No production SQL without explicit human approval.
- No destructive data operation without explicit human approval.
- No secrets in frontend code or tracked files.
- No schema/data shape breakage without compatibility notes.
- No optional business agent may claim a feature that is not built, verified, or explicitly marked as roadmap.
- No "tests passed", "deployed", "production-ready", "secure", or "enterprise-ready" claim without direct evidence.

## Truth Gate

- Important claims have evidence from a file, command output, user statement, or external deployment/admin source.
- Dependency versions come from `package.json` or lockfiles, not stale badges or prose docs.
- Verification claims name the command run and result.
- Production claims name the deployment/log/dashboard evidence.
- Unknowns are marked as unknown, not guessed.
- Source conflicts are called out in the handoff.

## Risk Gate

| Risk | Meaning | Required gate |
|---|---|---|
| `R0` | Docs/read-only | Consistency review |
| `R1` | Narrow local code | Tester review |
| `R2` | User-facing or shared logic | Product + tester |
| `R3` | Auth, data, mobile, release path | Security + production as relevant |
| `R4` | Production, destructive, secret, incident | Human approval + security + production + tester |

## Local Gate

- `git status --short` reviewed
- unrelated user changes identified and preserved
- `npm run test` passed or skipped with reason
- `npm run build` passed or skipped with reason
- `npm run cap:build` run only when mobile wrapper assets must refresh

## Supabase Gate

- Migration is additive or has a clear compatibility plan
- RLS reviewed for owner, editor, and viewer roles
- Edge functions keep provider secrets server-side
- Storage buckets and signed/public URLs are intentional
- Supabase advisors run when project connection is available

## Frontend Gate

- Local-only mode still works
- Authenticated sync still has a fallback path
- Mobile layouts handle 320px width
- Export/report flows still lazy-load or stay isolated
- Long names, large amounts, and empty states are handled

## Security Gate

- No secret exposure through `VITE_` variables except publishable keys
- No user data in logs beyond what is needed for debugging
- Destructive actions have confirmation and recovery path
- Public routes reveal only intended data
- AI/OCR flows do not send unnecessary sensitive data

## Business Gate

- Coding is complete and verified, or the user explicitly requested business work
- Marketing and sales copy describes current capability separately from roadmap
- Pricing and finance assumptions are stated
- Legal/compliance text is clearly a draft for human review
- Business output does not change code unless the user asks for code changes

## Release Handoff

Include:

- Commit or build identifier
- Tests run
- Env changes
- Supabase migrations/functions changed
- Rollback path
- Smoke test checklist
- Approval status
