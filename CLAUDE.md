# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server on port 8080
npm run build        # Production build → dist/
npm run lint         # ESLint
npm run test         # Run all tests once (Vitest)
npm run test:watch   # Watch mode
npm run test -- src/test/specific.test.ts  # Single test file
```

For local development with Netlify functions:
```bash
netlify dev          # Uses netlify.toml: targetPort=8081, wraps Vite on 8080
```

## Architecture

**FairHire** is a gender salary-gap analyzer for women in Mexico. The user pastes a job description and CV; the app returns a fit score, missing skills, pay gap context, negotiation tips, and a cover letter — all via Claude.

### Tech Stack
- React 18 + TypeScript + Vite (SPA, `dist/`)
- Tailwind CSS + shadcn/ui + Radix UI
- TanStack Query v5 for INEGI data caching
- i18next (Spanish `es` / English `en`)
- Vitest + React Testing Library

### Request Flow

```
Frontend (src/lib/claude-analyzer.ts)
  → POST /api/analyze  {jobDescription, cvText, language}
  → Netlify Function (netlify/functions/analyze.ts)
      → loads INEGI salary context from data/salary_benchmarks.json
      → calls Anthropic API (claude-sonnet-4-20250514, max_tokens: 2000)
      → validates + strips markdown from JSON response
  → returns AnalysisResult { fitScore, fitSummary, missingSkills,
                              payGapContext, salaryNegotiationTips, coverLetter }
```

INEGI salary benchmarks are served by a second function (`inegi-benchmark.ts`) and cached for 7 days by React Query via the `useSalaryBenchmark` hook. The `SalaryBenchmark` component is lazy-loaded.

### Dual Deploy Setup
The project has parallel implementations for both Netlify and Vercel:
- `netlify/functions/` ↔ `api/` (Vercel API routes)
- `netlify.toml` ↔ `vercel.json`

Keep both in sync when modifying backend logic.

### Key Files
| File | Purpose |
|------|---------|
| `netlify/functions/analyze.ts` | Main AI analysis endpoint (source of truth) |
| `netlify/functions/inegi-benchmark.ts` | Salary data endpoint |
| `api/analyze.ts` | Vercel mirror of analyze function |
| `src/lib/claude-analyzer.ts` | Frontend API client + retry logic |
| `src/hooks/useSalaryBenchmark.ts` | React Query hook for INEGI data |
| `src/pages/Index.tsx` | Main page — form + result cards |
| `src/i18n.ts` | i18next setup, loads `src/locales/{es,en}/` |

### Environment Variables
- `ANTHROPIC_API_KEY` — required (set in Netlify dashboard or `.env`)
- `ANTHROPIC_MODEL` — optional override (default: `claude-sonnet-4-20250514`)
- `INEGI_DATA_PATH` — path to `salary_benchmarks.json` (different per platform)

### Input Validation
Both functions enforce a 10,000-character max per field to prevent token runaway. Client-side retry uses exponential backoff (`src/lib/utils.ts → retryWithBackoff`) to handle 529 overload errors.

### Deployment
- **Production:** Netlify auto-deploys from `main` → https://fairfit-ai.netlify.app
- Do not push directly to `main` (triggers a Netlify build, burns free-tier credits)
- Always work on feature branches
