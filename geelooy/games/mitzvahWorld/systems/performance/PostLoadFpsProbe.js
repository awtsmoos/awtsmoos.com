// B"H
/** @file PostLoadFpsProbe.js @description Quiet actual post-load FPS probe. */
import './FrameSubsystemCounters.js?v=step-by-step-20260621-bh1';
import { assertPostLoadFps } from './NoJankAssertions.js?v=animal-realism-proof-20260705-bh1';
import { installLongTaskReporter } from './LongTaskReporter.js';
import { gameplayReadyState } from '../streaming/GameplayReadyGate.js';
const SAMPLE_MS = 9000, QUIET_MS = 1800, LOG_EVERY_MS = 3000, TARGET_FPS = 60;
const now = () => performance.now();
const avg = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
function p95(v) { const xs = v.slice().sort((a, b) => a - b); return xs[Math.max(0, Math.floor(xs.length * .95) - 1)] || 0; }
function sceneReady(win) { const state = gameplayReadyState(win); return state.ready || !!((win.__AWTSMOOS_BOOT_LOADED__ || win.__AWTSMOOS_OLAM__ || win.olam || win.ikar?.olam) && win.document?.querySelector?.('canvas')); }
function makeReport(win, frameMs) { const fps = frameMs.map(ms => 1000 / Math.max(.001, ms)); const result = { sampleFrames:frameMs.length, avgFps:Number(avg(fps).toFixed(2)), minFps:Number(Math.min(...fps).toFixed(2)), p95FrameMs:Number(p95(frameMs).toFixed(2)), maxFrameMs:Number(Math.max(...frameMs).toFixed(2)), targetFps:TARGET_FPS, actualGameplayGate:true, longTasks:win.__AWTSMOOS_LONG_TASK_REPORTER__?.report?.() || null, counters:win.__AWTSMOOS_FRAME_COUNTERS__?.report?.() || null }; win.__AWTSMOOS_POST_LOAD_FPS_REPORT__ = result; return result; }
export function bootPostLoadFpsProbe(win = globalThis.window) { if (!win || win.__AWTSMOOS_POST_LOAD_FPS_PROBE__) return win?.__AWTSMOOS_POST_LOAD_FPS_PROBE__; installLongTaskReporter(win); const state = { waiting:true, started:false, frames:[], last:0, start:0, lastLog:0, targetFps:TARGET_FPS }; win.__AWTSMOOS_POST_LOAD_FPS_PROBE__ = state; const wait = () => sceneReady(win) ? setTimeout(start, QUIET_MS) : setTimeout(wait, 250); const start = () => { state.waiting = false; state.started = true; state.start = now(); state.last = state.start; state.lastLog = state.start; requestAnimationFrame(tick); }; const tick = t => { const dt = t - state.last; state.last = t; if (dt > 0 && dt < 250) state.frames.push(dt); if (t - state.lastLog >= LOG_EVERY_MS) { state.lastLog = t; makeReport(win, state.frames); } if (t - state.start < SAMPLE_MS) requestAnimationFrame(tick); else assertPostLoadFps(makeReport(win, state.frames)); }; wait(); return state; }
bootPostLoadFpsProbe(); export default bootPostLoadFpsProbe;
