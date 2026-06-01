# Progressive Evaluation — MVP Prototype

Speed-first AI answers with **optional** specialist evaluator review for trust calibration.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local NVIDIA testing (optional)

1. Copy `env.local.template` to `.env.local` and paste your `NVIDIA_API_KEY`.
2. Set flags as needed (restart `npm run dev` after changes).
3. Watch **server terminal** for `[dev] answer source:` and `[dev] evaluator source:` lines.
4. Watch **browser console** for `[dev] client ...` lines during development only.

```bash
npm run verify:local
```

### Mixed evaluator fallback (dev only)

In `.env.local`, set `DEV_FORCE_MOCK_EVALUATORS=research` while live evaluators are on. Reasoning/Writing/Risk use NVIDIA; Research uses mock → `source: mixed`.

### Fallback checks

| Scenario | Expected server log | UI |
|----------|---------------------|-----|
| Flags off | `mock (live flag off)` | Source: Mock |
| Missing key | `mock (missing NVIDIA_API_KEY)` | Source: Mock |
| Bad key / 401 | `mock (NVIDIA error fallback)` | Source: Mock |
| Live success | `answer source: live` | Source: Live (NVIDIA) |

## Flow

1. Submit a prompt → first answer (mock or live)
2. Click **Evaluate this answer**
3. Select up to 3 evaluators → **Run evaluation**
4. Review transparent evaluator cards (no scores)
5. Choose: **Keep** · **Revise using findings** · **Try different approach**

## Project structure

```
src/
  app/api/chat      # first answer (NVIDIA + mock fallback)
  app/api/evaluate  # evaluators (NVIDIA + mock fallback)
  lib/api.ts        # generateAnswer()
  lib/evaluationApi.ts
  lib/evaluatorPrompts.ts
```

Model default: `meta/llama-3.1-8b-instruct` (512 tokens answer, 400 per evaluator).