import { useEffect, useMemo, useState } from 'react';
import {
  FORMULAS,
  type Formula,
  PCT_TABLE,
  brzycki,
  epley,
  estimate,
  fmt,
  lombardi,
  oconner,
  roundTo,
} from './calc';

type Unit = 'kg' | 'lb';

function read() {
  try {
    const p = new URLSearchParams(window.location.search);
    const f = p.get('f') as Formula | null;
    return {
      w: p.get('w') ?? '100',
      r: p.get('r') ?? '5',
      unit: (p.get('u') === 'lb' ? 'lb' : 'kg') as Unit,
      formula: FORMULAS.some((x) => x.id === f) ? (f as Formula) : ('average' as Formula),
    };
  } catch {
    return { w: '100', r: '5', unit: 'kg' as Unit, formula: 'average' as Formula };
  }
}

export default function App() {
  const init = read();
  const [wStr, setWStr] = useState(init.w);
  const [rStr, setRStr] = useState(init.r);
  const [unit, setUnit] = useState<Unit>(init.unit);
  const [formula, setFormula] = useState<Formula>(init.formula);
  const [copied, setCopied] = useState(false);

  const w = Number(wStr);
  const r = Math.round(Number(rStr));
  const valid = w > 0 && r >= 1 && r <= 20;

  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('w', wStr);
      u.searchParams.set('r', rStr);
      u.searchParams.set('u', unit);
      u.searchParams.set('f', formula);
      window.history.replaceState(null, '', u.toString());
    } catch {
      /* ignore */
    }
  }, [wStr, rStr, unit, formula]);

  const oneRM = useMemo(() => (valid ? estimate(formula, w, r) : 0), [valid, formula, w, r]);
  const step = unit === 'kg' ? 2.5 : 5;

  const allFormulas = useMemo(
    () =>
      valid
        ? [
            { name: 'Epley', v: epley(w, r) },
            { name: 'Brzycki', v: brzycki(w, r) },
            { name: 'Lombardi', v: lombardi(w, r) },
            { name: "O'Conner", v: oconner(w, r) },
          ].filter((x) => x.v > 0)
        : [],
    [valid, w, r],
  );

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="app">
      <header>
        <h1>One-Rep Max Calculator</h1>
        <p className="tag">
          Estimate the most you could lift for a single rep from a set you have actually done — and
          get the training weights for every rep range off that number.
        </p>
      </header>

      <div className="inputs">
        <label className="f">
          <span>Weight lifted</span>
          <div className="ibox">
            <input
              type="text"
              inputMode="decimal"
              value={wStr}
              onChange={(e) => setWStr(e.target.value.replace(/[^0-9.]/g, ''))}
            />
            <button
              className="unit"
              onClick={() => setUnit((u) => (u === 'kg' ? 'lb' : 'kg'))}
              type="button"
            >
              {unit}
            </button>
          </div>
        </label>
        <label className="f">
          <span>Reps performed</span>
          <input
            className="reps"
            type="text"
            inputMode="numeric"
            value={rStr}
            onChange={(e) => setRStr(e.target.value.replace(/[^0-9]/g, ''))}
          />
        </label>
      </div>

      <div className="formulapick">
        {FORMULAS.map((f) => (
          <button key={f.id} className={formula === f.id ? 'on' : ''} onClick={() => setFormula(f.id)} title={f.note}>
            {f.name}
          </button>
        ))}
      </div>

      {valid ? (
        <>
          <div className="answer">
            <span>Estimated 1-rep max</span>
            <strong>{fmt(oneRM, unit)}</strong>
            <span className="sub">
              from {fmt(w, unit)} × {r} rep{r === 1 ? '' : 's'} ·{' '}
              {FORMULAS.find((f) => f.id === formula)!.name} formula
            </span>
          </div>

          {allFormulas.length > 0 && (
            <div className="compare">
              <h2>By formula</h2>
              <div className="frow">
                {allFormulas.map((x) => (
                  <div key={x.name} className={estimate(formula, w, r).toFixed(0) === x.v.toFixed(0) ? 'sel' : ''}>
                    <b>{Math.round(x.v)}</b>
                    <span>{x.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2>Training weights</h2>
          <p className="note">
            Rounded to the nearest {step} {unit}. These are a guide — bar speed and how you feel on
            the day matter more than the exact number.
          </p>
          <div className="tablewrap">
            <table className="pct">
              <thead>
                <tr>
                  <th>% of 1RM</th>
                  <th>Weight</th>
                  <th>Typical reps</th>
                </tr>
              </thead>
              <tbody>
                {PCT_TABLE.map((row) => (
                  <tr key={row.pct}>
                    <td>{row.pct}%</td>
                    <td>{roundTo((oneRM * row.pct) / 100, step)} {unit}</td>
                    <td>{row.reps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="share" onClick={share}>
            {copied ? 'Link copied' : 'Copy shareable link'}
          </button>
        </>
      ) : (
        <p className="hint">
          Enter a weight and a rep count between 1 and 20. Estimates get less reliable above about 10
          reps.
        </p>
      )}

      <section className="explainer">
        <h2>How a 1RM estimate works</h2>
        <p>
          You rarely need to actually attempt a true one-rep max to know roughly what it is. If you
          can do a weight for a few clean reps, published formulas map that back to a single-rep
          number. They all agree closely at low reps and drift apart as reps climb, because muscular
          endurance varies a lot between people and lifts.
        </p>
        <h3>The formulas</h3>
        <ul>
          <li><b>Epley:</b> weight × (1 + reps ÷ 30). The most common; slightly generous at higher reps.</li>
          <li><b>Brzycki:</b> weight × 36 ÷ (37 − reps). Conservative; breaks down near 37 reps.</li>
          <li><b>Lombardi:</b> weight × reps^0.10. A power curve.</li>
          <li><b>O'Conner:</b> weight × (1 + reps ÷ 40). The most conservative of the four.</li>
          <li><b>Average:</b> the mean of the four — a reasonable default when you have no reason to prefer one.</li>
        </ul>
        <h3>Using the training-weight table</h3>
        <p>
          Programmes are usually written as a percentage of your 1RM — "5×5 at 80%", "work up to a
          heavy triple around 90%". The table converts your estimated 1RM into those weights and
          shows the rep count each percentage roughly corresponds to. Deadlifts often allow a few
          more reps at a given percentage than the bench press; adjust to your own experience.
        </p>
        <h3>Accuracy and safety</h3>
        <p>
          Treat the number as a starting point, not a target for today. Estimates are most reliable
          from sets of 2–5 reps and get rough past 10. Warm up properly, use a spotter or safety pins
          for heavy attempts on the bench and squat, and never chase a number with bad form. This is
          general training information, not coaching or medical advice.
        </p>
        <h3>Is anything sent to a server?</h3>
        <p>No. The maths runs in your browser; your inputs are only stored in the page link.</p>
        <footer>One-Rep Max Calculator · training info only · runs in your browser · no sign-up</footer>
      </section>
    </div>
  );
}
