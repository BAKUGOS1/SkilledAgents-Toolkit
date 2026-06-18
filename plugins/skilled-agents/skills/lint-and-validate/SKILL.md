---
name: lint-and-validate
description: "MANDATORY: Run validation after EVERY code change. No task is done until the code is error-free."
risk: safe
source: community (adapted from antigravity-awesome-skills)
---

# Lint and Validate — Wrkly Edition

> **MANDATORY:** Run validation after EVERY code change. Do not finish a task until the code is error-free.

## Quality Loop

1. **Write/Edit Code**
2. **Run Audit** (see commands below)
3. **Analyze Report** — check for errors, warnings, type mismatches
4. **Fix & Repeat** — submitting code with failures is NOT allowed

## Validation Commands

### Backend (wrkly-api/)
```bash
# Type check
cd wrkly-api && npx tsc --noEmit

# Run tests
cd wrkly-api && pnpm test

# Run tests with coverage
cd wrkly-api && pnpm test:coverage

# Security audit
cd wrkly-api && npm audit --audit-level=high
```

### Frontend (wrkly-web/)
```bash
# Full build (includes type check + lint)
cd wrkly-web && pnpm build

# Type check only
cd wrkly-web && npx tsc --noEmit

# Lint
cd wrkly-web && pnpm lint
```

### Full Project Validation
```bash
# Run this before every commit
cd wrkly-api && npx tsc --noEmit && pnpm test && cd ../wrkly-web && pnpm build
```

## Error Handling

| Error Type | Action |
|------------|--------|
| TypeScript error | Fix type mismatch immediately — never use `// @ts-ignore` |
| ESLint warning | Fix the style issue or disable with inline comment + justification |
| Test failure | Fix the code, not the test (unless the test is wrong) |
| Build failure | Check import paths, missing dependencies, Next.js config |
| Prisma error | Run `npx prisma generate` after schema changes |

## Strict Rules
- ❌ Never commit code that fails `tsc --noEmit`
- ❌ Never commit code that fails `pnpm test`
- ❌ Never commit code that fails `pnpm build`
- ✅ Always run the full validation loop before marking a task as done
