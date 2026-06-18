---
name: test-driven-development
description: "Use when implementing any feature or bugfix in Wrkly — write the test first, watch it fail, write minimal code to pass."
risk: safe
source: community (adapted from antigravity-awesome-skills)
---

# Test-Driven Development — Wrkly Edition

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

## The Iron Law
```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

## Red-Green-Refactor Cycle

### RED — Write Failing Test
```typescript
// wrkly-api/tests/routes/boards.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('GET /api/workspaces/:id/boards', () => {
  it('should return 401 when not authenticated', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/workspaces/test-id/boards',
    });
    expect(response.statusCode).toBe(401);
  });
});
```

### Verify RED
```bash
cd wrkly-api && pnpm test
# FAIL: expected 401, got... (confirms test catches the right thing)
```

### GREEN — Minimal Code
Write the simplest code to make the test pass. Don't over-engineer.

### Verify GREEN
```bash
cd wrkly-api && pnpm test
# PASS — all green
```

### REFACTOR — Clean Up
After green only: remove duplication, improve names, extract helpers. Keep tests green.

## Wrkly-Specific Test Patterns

### Route Tests (Integration)
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';

describe('POST /api/ai/command', () => {
  it('should return 503 when AI_COMMANDS feature is disabled', async () => {
    // Test feature flag gating
  });

  it('should return 400 for invalid boardId', async () => {
    // Test Zod validation
  });

  it('should parse command and return structured actions', async () => {
    // Test happy path with mocked OpenAI
  });
});
```

### Service Tests (Unit)
```typescript
import { describe, it, expect, vi } from 'vitest';
import { aiService } from '../src/services/ai';

describe('AIService.parseCommand', () => {
  it('should return actions with confidence score', async () => {
    vi.spyOn(aiService['client'].chat.completions, 'create')
      .mockResolvedValue(/* mock OpenAI response */);
    const result = await aiService.parseCommand('move all cards to Done', mockContext);
    expect(result.actions).toBeInstanceOf(Array);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });
});
```

### What to Mock
- ✅ Mock: OpenAI API, Resend email, Redis, external HTTP
- ❌ Don't mock: Prisma queries (use test DB or in-memory), Zod schemas, your own utils

## Verification Checklist
- [ ] Every new function/route has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass: `cd wrkly-api && pnpm test`
- [ ] Type check passes: `npx tsc --noEmit`
- [ ] Edge cases and errors covered
