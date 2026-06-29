// B"H
/** BrowserFrameTraceHarness: real-browser RAF/long-task proof harness using RuntimeLoopPolicy. */
import { defer, rafLoop } from './RuntimeLoopPolicy.js';
const scope = globalThis;
const KEY = '__MITZVAH_BROWSER_FRAME_TRACE__';
function safeNow() { return scope.performance?.now?.() ?? Date.now(); }
function percentile(values, p) { if (!values.length) return 0; const xs = [...values].sort((a,b)=>a-b); return xs[Math.min(xs.length - 1, Math.floor(xs.length * p))]; }
export function createBrowserFrameTraceHarness(options = {}) {
  const sampleLimit = Number(options.sampleLimit || 240);
  const state = { active:false, startedAt:0, frames:[], longTasks:[], last:0, realBrowser:Boolean(scope.document && scope.requestAnimationFrame), maxSamples:sampleLimit };
  let observer = null;
  const loop = rafLoop('browser-frame-trace', ts => { if (state.last) state.frames.push(Math.max(0, ts - state.last)); state.last = ts; }, { limit:sampleLimit });
  function observeLongTasks() { try { if (!scope.PerformanceObserver) return; observer = new scope.PerformanceObserver(list => { for (const entry of list.getEntries()) state.longTasks.push({ name:entry.name, start:entry.startTime, duration:entry.duration }); }); observer.observe({ entryTypes:['longtask'] }); } catch {} }
  function start(reason = 'manual') { if (!state.realBrowser || state.active) return snapshot(reason); state.active = true; state.startedAt = safeNow(); state.last = 0; observeLongTasks(); loop.start(); return snapshot(reason); }
  function stop(reason = 'manual') { state.active = false; loop.stop(); observer?.disconnect?.(); const snap = snapshot(reason); scope.dispatchEvent?.(new CustomEvent('mitzvah-world:browser-frame-trace', { detail:snap })); return snap; }
  function snapshot(reason = 'snapshot') { const frames = state.frames; const avg = frames.length ? frames.reduce((a,b)=>a+b,0) / frames.length : 0; const max = frames.length ? Math.max(...frames) : 0; const fps = avg ? 1000 / avg : 0; return { reason, realBrowser:state.realBrowser, active:state.active, frames:frames.length, avgMs:Number(avg.toFixed(3)), p95Ms:Number(percentile(frames, .95).toFixed(3)), maxMs:Number(max.toFixed(3)), approxFps:Number(fps.toFixed(2)), longTasks:state.longTasks.slice(-20), olamReady:Boolean(scope.__AWTS_OLAM__), rendererReady:Boolean(scope.__AWTS_OLAM__?.renderer), playerReady:Boolean(scope.__AWTS_OLAM__?.player) }; }
  return { state, start, stop, snapshot };
}
const harness = scope[KEY] || createBrowserFrameTraceHarness();
scope[KEY] = harness;
if (harness.state.realBrowser) defer('auto-browser-frame-trace', () => harness.start('auto-browser-load'), 1200);
export default harness;
