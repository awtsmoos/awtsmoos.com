// B"H
/**
 * @file FrameSubsystemCounters.js
 * @description
 * Tiny shared counters for frame work. The Awtsmoos lets every subsystem admit
 * how much it did, so beauty can grow without hidden per-frame fog.
 */
const LIMIT = 240;
const state = { frame:0, startedAt:Date.now(), rows:[], current:null, totals:{} };

function freshFrame() {
  return { at:performance.now(), counts:{}, notes:[] };
}

export function beginFrame() {
  state.frame += 1;
  state.current = freshFrame();
  state.rows.push(state.current);
  if (state.rows.length > LIMIT) state.rows.shift();
  return state.current;
}

export function countWork(name, amount = 1, note = "") {
  if (!state.current) beginFrame();
  const key = String(name || "unknown");
  const n = Number.isFinite(Number(amount)) ? Number(amount) : 1;
  state.current.counts[key] = (state.current.counts[key] || 0) + n;
  state.totals[key] = (state.totals[key] || 0) + n;
  if (note) state.current.notes.push({ key, note });
}

export function subsystemReport() {
  const recent = state.rows.slice(-60);
  const peaks = {};
  for (const row of recent) for (const [key, value] of Object.entries(row.counts)) peaks[key] = Math.max(peaks[key] || 0, value);
  return { frame:state.frame, startedAt:state.startedAt, totals:{ ...state.totals }, peaks, recentFrames:recent.length };
}

export function installFrameCounterLoop(win = globalThis.window) {
  if (!win || win.__AWTSMOOS_FRAME_COUNTER_LOOP__) return;
  win.__AWTSMOOS_FRAME_COUNTER_LOOP__ = true;
  const loop = () => { beginFrame(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  win.__AWTSMOOS_FRAME_COUNTERS__ = { countWork, report:subsystemReport };
}

installFrameCounterLoop();
export default { beginFrame, countWork, subsystemReport, installFrameCounterLoop };
