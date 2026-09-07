// One-rep-max (1RM) estimation. Several published formulas; all take a weight
// lifted for `reps` reps and estimate the max for a single rep.

export type Formula = 'epley' | 'brzycki' | 'lombardi' | 'oconner' | 'average';

export const FORMULAS: { id: Formula; name: string; note: string }[] = [
  { id: 'average', name: 'Average of all', note: 'a sensible default' },
  { id: 'epley', name: 'Epley', note: 'w × (1 + reps/30)' },
  { id: 'brzycki', name: 'Brzycki', note: 'w × 36 / (37 − reps)' },
  { id: 'lombardi', name: 'Lombardi', note: 'w × reps^0.10' },
  { id: 'oconner', name: "O'Conner", note: 'w × (1 + reps/40)' },
];

export function epley(w: number, r: number): number {
  return r === 1 ? w : w * (1 + r / 30);
}
export function brzycki(w: number, r: number): number {
  return r >= 37 ? 0 : (w * 36) / (37 - r);
}
export function lombardi(w: number, r: number): number {
  return w * Math.pow(r, 0.1);
}
export function oconner(w: number, r: number): number {
  return w * (1 + r / 40);
}

export function estimate(formula: Formula, w: number, r: number): number {
  if (!(w > 0) || !(r >= 1)) return 0;
  if (r === 1) return w;
  switch (formula) {
    case 'epley':
      return epley(w, r);
    case 'brzycki':
      return brzycki(w, r);
    case 'lombardi':
      return lombardi(w, r);
    case 'oconner':
      return oconner(w, r);
    case 'average': {
      const vals = [epley(w, r), brzycki(w, r), lombardi(w, r), oconner(w, r)].filter((v) => v > 0);
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    }
  }
}

// Standard %1RM → reps table (Prilepin-ish / NSCA common values).
export const PCT_TABLE: { pct: number; reps: number }[] = [
  { pct: 100, reps: 1 },
  { pct: 95, reps: 2 },
  { pct: 93, reps: 3 },
  { pct: 90, reps: 4 },
  { pct: 87, reps: 5 },
  { pct: 85, reps: 6 },
  { pct: 83, reps: 7 },
  { pct: 80, reps: 8 },
  { pct: 77, reps: 9 },
  { pct: 75, reps: 10 },
  { pct: 70, reps: 12 },
  { pct: 67, reps: 15 },
  { pct: 60, reps: 20 },
];

export function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

export function fmt(n: number, unit: 'kg' | 'lb'): string {
  return `${Math.round(n).toLocaleString()} ${unit}`;
}
