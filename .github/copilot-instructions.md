# Copilot Instructions — navi-bot

## Project Overview

`navi-bot` is a personal Telegram bot built with **grammy** and **TypeScript**. It handles calendar reminders, interview practice sessions, and vibe-coding workflows. The backend uses **Prisma** (PostgreSQL), **BullMQ** (job queues), **ioredis** (sessions/cache), and **Fastify** for webhook handling.

---

## Language & Module System

- TypeScript 6, **strict mode** enabled (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **ESM-only** project (`"type": "module"` in package.json)
- All local imports **must** use `.js` extension at the end, even for `.ts` source files:
  ```ts
  import { logger } from '../../shared/logger.js';   // ✅
  import { logger } from '../../shared/logger';       // ❌
  ```
- Module resolution: `NodeNext`. Target: `ES2022`.

---

## Project Structure

```
src/
  bot/
    commands/       # /start, /help, etc.
    handlers/       # Message & callback handlers per module
    middleware/     # auth, session, rate limit
    formatters/     # Message formatting helpers
  modules/
    calendar/       # Task/reminder logic
    interview/      # Interview practice sessions
    vibe-code/      # Vibe-coding workflow
  services/
    session.store.ts  # In-memory session store with auto-cleanup
  db/
    client.ts       # Singleton Prisma client
  shared/
    config.ts       # Zod-validated env config (fail-fast)
    logger.ts       # Pino logger instance
    types/          # All shared TypeScript types and enums
tests/              # Mirrors src/ structure: src/foo/bar.ts → tests/foo/bar.test.ts
```

---

## Framework Conventions

### grammy (Telegram Bot)

- Middleware signature: `async (ctx: Context, next: NextFunction): Promise<void>`
- **Always** `await next()` to continue the middleware chain — missing it silently drops all subsequent handlers
- `ctx.from` is optional — always use optional chaining: `ctx.from?.id`
- Rate limit maps and any module-level state **must be declared outside** the middleware function; declaring inside means they reset on every request:
  ```ts
  // ✅ Correct — persists across requests
  const rateLimitMap = new Map<number, number>();
  export async function authMiddleware(ctx, next) { ... }

  // ❌ Wrong — resets on every call, rate limiting never works
  export async function authMiddleware(ctx, next) {
    const rateLimitMap = new Map<number, number>();
  }
  ```
- Prefer `ctx.reply()` inside handlers; use `bot.api.sendMessage()` only for proactive messages outside of request context

### Prisma ORM

- Never cast query results with `as any` — use proper typed select/include
- Multi-step operations **must** use `prisma.$transaction([])`
- Never expose raw Prisma errors to the user — log with `logger.error`, reply with a generic message
- Use explicit `select` or `include` to avoid over-fetching
- IDs use CUID by default — never pass `id` manually unless intentional

### Zod (Validation)

- All external input (Telegram messages, API body) must go through a Zod schema
- Use `z.safeParse()` when failure is recoverable (return a validation error message to user)
- Use `z.parse()` only when a schema mismatch is a programmer error (should throw)
- Define schemas in `src/shared/types/` — do not inline complex schemas inside handlers

### Pino (Logging)

- Always use structured logging — pass context as an object, message as second arg:
  ```ts
  logger.info({ userId, module: 'calendar' }, 'Task created');  // ✅
  logger.info(`Task created for ${userId}`);                     // ❌
  ```
- Log levels: `error` for thrown errors, `warn` for recoverable issues, `info` for lifecycle events, `debug` for trace/dev only
- **Never log sensitive data**: message content, tokens, passwords. UserId in `warn` context is acceptable.
- Use child loggers per module: `const log = logger.child({ module: 'interview' })`

### BullMQ (Job Queues)

- Always type Queue and Worker with generics: `new Queue<JobPayload>('queue-name')`
- Set `attempts` and `backoff` on all job options
- Workers must have explicit `failed` event handlers — do not rely on default silent failure

### ioredis (Cache/Sessions)

- Every key must have a TTL — never store without expiry
- Namespace all keys by module: `session:${userId}`, `rate:${userId}`, `brief:${userId}`

---

## Error Handling

- Async entry points (`main()`, worker processors) must have `.catch()` or `try/catch`
- Never swallow errors with empty `catch` blocks
- Config errors at startup → `logger.error(...)` then `process.exit(1)` (fail-fast)
- Distinguish:
  - **User-facing errors**: `await ctx.reply('Có lỗi xảy ra, vui lòng thử lại.')`
  - **Internal errors**: `logger.error({ err }, 'Unexpected error')` + generic reply

---

## TypeScript Conventions

- **No `any`** — use `unknown` and narrow explicitly
- Use `readonly` for data objects and parameters that must not be mutated
- Prefer **discriminated unions** for state machines (see `SessionState` in `src/shared/types/`)
- Use TypeScript `enum` or `const enum` for domain values — not plain string literals
- Enums are defined in `src/shared/types/` and re-exported from `index.ts`

---

## Testing

- Framework: **Vitest v4** — do NOT use Jest APIs
- Test files live in `tests/` mirroring `src/`: `src/bot/middleware/auth.middleware.ts` → `tests/bot/middleware/auth.middleware.test.ts`
- Mock external modules at the top of the test file with `vi.mock()`
- Reset mocks in `beforeEach`: `vi.clearAllMocks()`

**grammy mocking pattern:**
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Context, NextFunction } from 'grammy';

const mockCtx = {
  from: { id: 123456 },
  reply: vi.fn().mockResolvedValue(undefined),
} as unknown as Context;

const mockNext: NextFunction = vi.fn().mockResolvedValue(undefined);
```

**Coverage targets per file:**
1. Happy path
2. Auth/validation failure
3. Missing optional fields (`ctx.from` is undefined)
4. Error propagation (awaited call throws)
5. Boundary conditions (rate limit, empty result, null)
6. Side effects (verify `reply()` called, `next()` called or not)

---

## Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Files | `feature.type.ts` | `auth.middleware.ts` |
| Functions | camelCase | `authMiddleware` |
| Types/Interfaces | PascalCase + suffix | `SessionData`, `CalendarIntent` |
| Enums | PascalCase | `TaskStatus`, `Priority` |
| Enum values | UPPER_SNAKE_CASE | `PENDING`, `IN_PROGRESS` |
| Constants | UPPER_SNAKE_CASE | `RATE_LIMIT_MS` |
| Directories | kebab-case or lowercase | `vibe-code/`, `calendar/` |

---

## CI/CD — AI Review Pipeline

On every PR, GitHub Actions runs:
1. **`scripts/ai-review.mjs`** — reviews the diff with `o3` model against these conventions, comments on PR
2. **`scripts/ai-gen-tests.mjs`** — generates Vitest unit tests for changed `.ts` files with `o4-mini`, commits to branch

Both scripts use `GITHUB_TOKEN` (no extra secrets needed) via the GitHub Models API endpoint.
