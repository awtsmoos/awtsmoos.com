// B"H
/** @file PostLoadFpsProbe.js @description Quiet actual post-load FPS probe. */
import "./FrameSubsystemCounters.js?v=step-by-step-20260621-bh1";
import { assertPostLoadFps } from "./NoJankAssertions.js?v=animal-realism-proof-20260705-bh1";
import { installLongTaskReporter } from "./LongTaskReporter.js";
import { gameplayReadyState } from "../streaming/GameplayReadyGate.js";

const SAMPLE_MS = 9000, QUIET_MS = 1800, LOG_EVERY_MS = 3000, TARGET_FPS = 60;
const now = () => performance.now();
const avg = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

function p95(values) {
  const xs = values.slice().sort((a, b) => a - b);
  return xs[Math.max(0, Math.floor(xs.length * .95) - 1)] || 0;
}

function sceneReady(win) {
  const state = gameplayReadyState(win);
  return state.ready || !!((win.__AWTSMOOS_BOOT_LOADED__ || win.__AWTSMOOS_OLAM__ || win.olam || win.ikar?.olam) && win.document?.querySelector?.("canvas"));
}

function guardianReport(win) {
  const guardian = win.__AWTSMOOS_FPS_GUARDIAN__ || null;
  return guardian ? {
    stage:guardian.stage,
    name:guardian.config?.name || null,
    avgFps:guardian.avgFps || 0,
    minFps:guardian.minFps || 0,
    stable60:Boolean(guardian.stable60),
    config:guardian.config || null
  } : null;
}

function makeReport(win, frameMs) {
  const fps = frameMs.map(ms => 1000 / Math.max(.001, ms));
  const result = {
    sampleFrames:frameMs.length,
    avgFps:Number(avg(fps).toFixed(2)),
    minFps:Number(Math.min(...fps).toFixed(2)),
    p95FrameMs:Number(p95(frameMs).toFixed(2)),
    maxFrameMs:Number(Math.max(...frameMs).toFixed(2)),
    targetFps:TARGET_FPS,
    fpsGuardian:guardianReport(win),
    actualGameplayGate:true,
    longTasks:win.__AWTSMOOS_LONG_TASK_REPORTER__?.report?.() || null,
    counters:win.__AWTSMOOS_FRAME_COUNTERS__?.report?.() || null
  };
  win.__AWTSMOOS_POST_LOAD_FPS_REPORT__ = result;
  try {
    const doc = win.document;
    let node = doc?.querySelector?.('script[data-awtsmoos-fps-report="post-load"]');
    if (!node && doc?.createElement) {
      node = doc.createElement("script");
      node.type = "application/json";
      node.dataset.awtsmoosFpsReport = "post-load";
      doc.body?.appendChild(node);
    }
    if (node) node.textContent = JSON.stringify({ ...result, at:Date.now(), source:"PostLoadFpsProbe" }, null, 2);
  } catch {}
  return result;
}

export function bootPostLoadFpsProbe(win = globalThis.window) {
  if (!win || win.__AWTSMOOS_POST_LOAD_FPS_PROBE__) return win?.__AWTSMOOS_POST_LOAD_FPS_PROBE__;
  installLongTaskReporter(win);
  const state = { waiting:true, started:false, frames:[], last:0, start:0, lastLog:0, targetFps:TARGET_FPS };
  win.__AWTSMOOS_POST_LOAD_FPS_PROBE__ = state;
  const wait = () => sceneReady(win) ? setTimeout(start, QUIET_MS) : setTimeout(wait, 250);
  const start = () => { state.waiting = false; state.started = true; state.start = now(); state.last = state.start; state.lastLog = state.start; requestAnimationFrame(tick); };
  const tick = time => {
    const dt = time - state.last;
    state.last = time;
    if (dt > 0 && dt < 250) state.frames.push(dt);
    if (time - state.lastLog >= LOG_EVERY_MS) { state.lastLog = time; makeReport(win, state.frames); }
    if (time - state.start < SAMPLE_MS) requestAnimationFrame(tick);
    else assertPostLoadFps(makeReport(win, state.frames));
  };
  wait();
  return state;
}

bootPostLoadFpsProbe();
export default bootPostLoadFpsProbe;
