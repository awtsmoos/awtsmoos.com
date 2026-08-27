// B"H
// Profiler records named moments without forcing a UI.
export function createProfiler() {
  const marks = new Map();
  function mark(name, t = performance.now()) { marks.set(name, t); }
  function measure(a, b, t = performance.now()) { return +(t - (marks.get(a) || marks.get(b) || t)).toFixed(2); }
  return { mark, measure, clear: () => marks.clear() };
}
