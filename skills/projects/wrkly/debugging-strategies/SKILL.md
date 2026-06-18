---
name: debugging-strategies
description: "Systematic debugging for Wrkly's full-stack TypeScript monorepo — reproduce, trace, fix, verify."
risk: safe
source: community (adapted from antigravity-awesome-skills)
---

# Debugging Strategies — Wrkly Edition

Transform debugging from guesswork into systematic problem-solving.

## When to Use
- Tracking down elusive bugs in frontend or backend
- Investigating performance issues (slow queries, re-renders)
- Debugging production incidents on Railway/Vercel
- Analyzing Socket.io realtime sync issues
- Debugging auth/JWT token problems

## The Debug Loop

### 1. Reproduce
- **Backend**: Check Fastify logs (`app.log.info/error`)
- **Frontend**: Check browser console + Next.js terminal
- **Database**: Run `npx prisma studio` to inspect data state
- **Realtime**: Check Socket.io connection in browser DevTools → Network → WS

### 2. Isolate the Layer
| Symptom | Layer | Start Here |
|---------|-------|------------|
| 4xx/5xx API response | Route handler | `wrkly-api/src/routes/{resource}.ts` |
| Data not showing | Prisma query | Check `select:` fields, `isArchived` filter |
| Auth failure | JWT middleware | `wrkly-api/src/middleware/auth.ts` |
| Stale UI data | React Query cache | Check `queryKey`, `staleTime`, invalidation |
| Realtime not updating | Socket.io | `wrkly-api/src/lib/socket.ts` → event names |
| Styling broken | CSS tokens | `globals.css` dark/light mode variables |

### 3. Form Hypothesis
Before touching code, state: "I think X is happening because Y, and I can verify by Z."

### 4. Binary Search
- Comment out half the suspicious code
- Does the bug persist? → Problem is in the remaining half
- Repeat until you find the exact line

### 5. Common Wrkly Bugs

#### Prisma: Missing data
```typescript
// ❌ Bug: cards not showing
prisma.board.findUnique({ where: { id: boardId } })
// ✅ Fix: add select with nested relations
prisma.board.findUnique({
  where: { id: boardId },
  select: { lists: { select: { cards: { where: { isArchived: false } } } } }
})
```

#### Auth: 401 on valid token
```typescript
// Check: is authenticate middleware registered?
app.post('/endpoint', { preHandler: [authenticate] }, handler)
// Check: is JWT_SECRET the same between token generation and verification?
```

#### React Query: Stale data after mutation
```typescript
// ❌ Bug: list doesn't update after creating card
// ✅ Fix: invalidate the right query key
queryClient.invalidateQueries({ queryKey: ['board', boardId] })
```

#### Socket.io: Events not received
```typescript
// Check: is the client subscribing to the correct room?
socket.emit('join-board', boardId)
// Check: is the server emitting to the right room?
io.to(`board:${boardId}`).emit('card:created', data)
```

### 6. Fix and Verify
1. Write a failing test that reproduces the bug
2. Apply the minimal fix
3. Run `cd wrkly-api && pnpm test` — all green
4. Run `cd wrkly-web && pnpm build` — no type errors
5. Manually verify the fix in the browser

### 7. Document
Add a comment explaining WHY the fix works, not WHAT it does:
```typescript
// Fix: must filter by isArchived because soft-deleted cards were
// appearing in the board view count (issue #42)
where: { isArchived: false }
```
