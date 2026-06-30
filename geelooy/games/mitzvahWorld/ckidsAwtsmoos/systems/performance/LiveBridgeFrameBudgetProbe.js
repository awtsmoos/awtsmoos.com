// B"H
const avg = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const percentile = (xs, p) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(xs.length * p))] : 0;

export function createLiveBridgeFrameBudgetProbe(options = {}) {
  const now = options.now || (() => performance.now());
  const frames = [];
  function measure(fn) {
    const start = now();
    const value = fn();
    frames.push(now() - start);
    return value;
  }
  function report(extra = {}) {
    const worst = frames.length ? Math.max(...frames) : 0;
    return {
      frames:frames.length,
      avgMs:Number(avg(frames).toFixed(3)),
      p95Ms:Number(percentile(frames, .95).toFixed(3)),
      worstMs:Number(worst.toFixed(3)),
      targetFrameMs:16.67,
      logicBudgetOk:avg(frames) < (options.avgBudgetMs || 4) && worst < (options.worstBudgetMs || 16.67),
      browserRafMeasured:false,
      ...extra
    };
  }
  return { measure, report, frames };
}

export default createLiveBridgeFrameBudgetProbe;
