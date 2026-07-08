// B"H
/** @file LoadingProfiler.js @description Grouped loading-stage profiler: console.table only, longest first. */
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
function ensureProfiler() {
  if (typeof window === "undefined") return null;
  if (window.__AWTSMOOS_LOAD_PROFILER__) return window.__AWTSMOOS_LOAD_PROFILER__;
  const startedAt = now();
  const profiler = { startedAt, currentStage:null, currentStartedAt:startedAt, rows:[], finalized:false, lastPayload:null, seal:"grouped-table-only-profiler-20260708-bh8" };
  function label(stage) { return String(stage || "unknown").replace(/\s+/g, " ").slice(0, 96); }
  function closeCurrent(at = now()) {
    if (!profiler.currentStage) return;
    profiler.rows.push({ stage:profiler.currentStage, durationMs:Math.max(0, at - profiler.currentStartedAt), sinceStartMs:profiler.currentStartedAt - profiler.startedAt });
  }
  function groupedRows() {
    const map = new Map();
    for (const row of profiler.rows) {
      const prev = map.get(row.stage) || { stage:row.stage, count:0, totalMs:0, maxMs:0, firstSinceStartMs:row.sinceStartMs };
      prev.count += 1;
      prev.totalMs += row.durationMs;
      prev.maxMs = Math.max(prev.maxMs, row.durationMs);
      prev.firstSinceStartMs = Math.min(prev.firstSinceStartMs, row.sinceStartMs);
      map.set(row.stage, prev);
    }
    return [...map.values()].map(row => ({
      stage:row.stage,
      count:row.count,
      totalMs:Math.round(row.totalMs),
      maxMs:Math.round(row.maxMs),
      avgMs:Math.round(row.totalMs / Math.max(1, row.count)),
      firstSinceStartMs:Math.round(row.firstSinceStartMs)
    })).sort((a, b) => b.totalMs - a.totalMs);
  }
  function render() {
    const el = document.getElementById("genesisProfilerLog");
    if (!el) return;
    const liveMs = profiler.currentStage ? now() - profiler.currentStartedAt : 0;
    el.textContent = profiler.currentStage ? `▶ ${profiler.currentStage}: ${Math.round(liveMs)}ms` : "Profiler armed";
  }
  profiler.record = input => {
    if (profiler.finalized) return profiler.snapshot();
    const stage = label(input?.stage || input?.kind || input?.type || "progress"), at = now();
    profiler.lastPayload = input || null;
    if (stage !== profiler.currentStage) { closeCurrent(at); profiler.currentStage = stage; profiler.currentStartedAt = at; }
    render(); return profiler.snapshot();
  };
  profiler.snapshot = () => ({ startedAt:profiler.startedAt, currentStage:profiler.currentStage, elapsedMs:Math.round(now() - profiler.startedAt), rows:groupedRows(), finalized:profiler.finalized, seal:profiler.seal });
  profiler.finalize = reason => {
    if (profiler.finalized) return profiler.snapshot();
    closeCurrent(now()); profiler.finalized = true; render();
    const rows = groupedRows();
    window.__AWTSMOOS_LOAD_PROFILER_REPORT__ = { reason:String(reason || "final"), totalMs:Math.round(now() - profiler.startedAt), rows, seal:profiler.seal };
    console.log(`B"H LOAD PROFILER total ${window.__AWTSMOOS_LOAD_PROFILER_REPORT__.totalMs}ms grouped longest-first`);
    console.table(rows);
    return profiler.snapshot();
  };
  window.__AWTSMOOS_LOAD_PROFILER__ = profiler;
  window.__AWTSMOOS_LOAD_PROFILE__ = () => profiler.snapshot();
  return profiler;
}
export function recordLoadingStage(input = {}) { return ensureProfiler()?.record(input) || null; }
export function finalizeLoadingProfiler(reason = "world_final_ready") { return ensureProfiler()?.finalize(reason) || null; }
export function loadingProfilerSnapshot() { return ensureProfiler()?.snapshot() || null; }
if (typeof window !== "undefined") ensureProfiler();
