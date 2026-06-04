import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { dirname } from 'path';
import OpenAI from 'openai';

const MAX_FILE_CHARS = 16_000;

const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
});

const SYSTEM_PROMPT = `You are a senior TypeScript engineer writing unit tests for a grammy Telegram bot project (navi-bot).

## Project Context
- TypeScript 6, strict mode, ESM-only ("type": "module")
- All imports use .js extension: import { foo } from '../bar.js'
- Test framework: Vitest v4 (NOT Jest)
- Source structure: src/**/*.ts → test structure: tests/**/*.test.ts
- Prisma ORM with PostgreSQL, ioredis for sessions, grammy for Telegram

## Test Requirements

### Imports & Setup
\`\`\`typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Mock modules before importing the module under test
vi.mock('../../../db/client.js');          // Prisma
vi.mock('grammy');                          // Telegram context
vi.mock('ioredis');                         // Redis
\`\`\`

### Mocking grammy Context
- Create a typed mock: const mockCtx = { from: { id: 123 }, reply: vi.fn(), ... } as unknown as Context
- Mock NextFunction as: const mockNext = vi.fn().mockResolvedValue(undefined)
- Always assert whether next() was called or not — this validates middleware chain behavior

### Mocking Prisma
- Use vi.mocked(prisma.model.method).mockResolvedValue(...)
- Test both successful DB responses and rejection (throw new Error('DB error'))

### Test Structure
- One describe block per exported function/class
- Nested describe for logical groupings (e.g., 'when user is authorized', 'when rate limited')
- Use beforeEach to reset mocks: vi.clearAllMocks()
- Use afterEach to cleanup any timers or side effects

### Coverage Targets (REQUIRED for each file)
1. Happy path: normal successful execution
2. Authorization/validation failure cases
3. Missing or undefined optional fields (ctx.from?.id undefined, etc.)
4. Error propagation: what happens when an awaited call throws
5. Boundary conditions: rate limits, empty arrays, null values
6. Side effects: verify logger calls, reply calls, next() invocation

### Naming
- it('should [expected behavior] when [condition]')
- Descriptive but concise

## CRITICAL OUTPUT RULES
- Output ONLY valid TypeScript code — NO markdown fences, NO prose, NO comments explaining the test
- The file must be importable as-is by Vitest
- Use .js extensions on all local imports
- Do NOT import from the test file itself`;

// Lấy danh sách file TypeScript thay đổi (bỏ qua test files, generated, scripts)
function getChangedFiles() {
  const eventName = process.env.EVENT_NAME ?? 'push';
  const baseRef = process.env.BASE_REF;

  let diffCmd;
  if (eventName === 'pull_request' && baseRef) {
    diffCmd = `git diff --name-only origin/${baseRef}...HEAD`;
  } else {
    diffCmd = 'git diff --name-only HEAD~1..HEAD';
  }

  return execSync(diffCmd)
    .toString()
    .trim()
    .split('\n')
    .filter(
      (f) =>
        f.endsWith('.ts') &&
        !f.includes('.test.') &&
        !f.includes('.spec.') &&
        !f.includes('generated/') &&
        !f.includes('scripts/') &&
        existsSync(f),
    );
}

// src/bot/middleware/auth.middleware.ts → tests/bot/middleware/auth.middleware.test.ts
function toTestPath(srcPath) {
  return srcPath.replace(/^src\//, 'tests/').replace(/\.ts$/, '.test.ts');
}

const changedFiles = getChangedFiles();

if (changedFiles.length === 0) {
  writeFileSync('ai-tests-output.md', '## 🧪 AI Generated Tests\n\nNo TypeScript source files changed.');
  process.exit(0);
}

const summaryLines = [];

for (const file of changedFiles) {
  let code = readFileSync(file, 'utf8');

  if (code.length > MAX_FILE_CHARS) {
    code = code.slice(0, MAX_FILE_CHARS) + '\n// ... (truncated)';
  }

  console.log(`Generating tests for: ${file}`);

  const response = await client.chat.completions.create({
    model: 'o4-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `File: ${file}\n\n${code}` },
    ],
  });

  const testCode = response.choices[0].message.content
    .replace(/^```(?:typescript|ts)?\n?/m, '')
    .replace(/\n?```$/m, '');

  const testPath = toTestPath(file);
  const testDir = dirname(testPath);

  if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true });
  }

  writeFileSync(testPath, testCode);
  summaryLines.push(`- \`${testPath}\` ← generated from \`${file}\``);
  console.log(`  → written to ${testPath}`);
}

const summary = `## 🧪 AI Generated Tests\n\n${summaryLines.join('\n')}`;
writeFileSync('ai-tests-output.md', summary);
console.log('Test generation completed.');
