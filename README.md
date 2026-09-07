# one-rep-max-calculator

Estimate a one-rep max from a completed set. Weight + reps (+ kg/lb toggle),
pick a formula (Epley / Brzycki / Lombardi / O'Conner / average), get the 1RM,
a side-by-side of all four formulas, and a percentage-of-1RM training table
(100% → 60%, with typical reps) rounded to the nearest plate step. Inputs in the
URL.

**Live:** https://one-rep-max-calculator.correia95.workers.dev/

## Stack

- React 18 + TypeScript + Vite, no runtime deps beyond React
- Static-assets Cloudflare Worker

## Engine

[`src/calc.ts`](src/calc.ts): `epley` `w·(1+r/30)`, `brzycki` `w·36/(37−r)`,
`lombardi` `w·r^0.1`, `oconner` `w·(1+r/40)`, `estimate('average', …)` = mean of
the four. `PCT_TABLE` is the standard %1RM ↔ reps mapping.

Verified in Node: Epley 100×5 = 116.7, Brzycki 100×5 = 112.5, Epley 60×10 = 80,
1-rep passthrough, Brzycki guard at 37 reps, invalid-input → 0.

## Develop / deploy

```bash
npm install
npm run dev
npm run deploy
```
