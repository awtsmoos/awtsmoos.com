// B"H
/**
 * @file PostLoadFpsProbe.js
 * @description
 * Post-load FPS truth probe. It waits for a game/canvas/visual signal, ignores
 * startup jank, then samples gameplay frames and calls no-jank assertions.
 */
import "./FrameSubsystemCounters.js?v=step-by-step-20260621-bh1";
import { assertPostLoadFps } from "./NoJankAssertions.js?v=step-by-step-20260621-bh1";

const SAMPLE_MS = 12000;
const QUIET_MS = 2500;
const LOG_EVERY_MS = 3000;
const TARGET_FPS = 60;
const now = () => performance.now();
const avg = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
function p95(values) { const xs = values.slice().sort((a, b) => a - b); return xs[Math.max(0, Math.floor(xs.length * .95) - 1)] || 0; }
function sceneReady(win) { return !!(win.__AWTSMOOS_BOOT_LOADED__ || win.__AWTSMOOS_VISUAL_TUNING__ || win.__AWTSMOOS_OLAM__ || win.olam || win.ikar?.olam || document.querySelector("canvas")); }
function olamOf(win) { return win.__AWTSMOOS_OLAM__ || win.olam || win.ikar?.olam || win.mana?.activeOlam || null; }

function report(win, frameMs) {
  const fps = frameMs.map(ms => 1000 / Math.max(.001, ms));
  const olam = olamOf(win);
  const result = {
    sampleFrames:frameMs.length,
    avgFps:Number(avg(fps).toFixed(2)),
    minFps:Number(Math.min(...fps).toFixed(2)),
    p95FrameMs:Number(p95(frameMs).toFixed(2)),
    maxFrameMs:Number(Math.max(...frameMs).toFixed(2)),
    targetFps:TARGET_FPS,
    stable60:fps.every(x => x >= TARGET_FPS),
    counters:win.__AWTSMOOS_FRAME_COUNTERS__?.report?.() || null,
    npc:olam?.__livingRegionNpcRuntimeStats || null,
    spatial:olam?.__npcSpatialHashReport || null,
    visual:win.__AWTSMOOS_VISUAL_TUNING__ || null,
    textures:win.__AWTSMOOS_TEXTURE_PINGPONG_REPORT__ || null,
    beauty:win.__AWTSMOOS_BEAUTY_TUNING__ || null,
    scrollUi:win.__AWTSMOOS_SCROLL_UI__ || null,
    fpsGuardian:win.__AWTSMOOS_FPS_GUARDIAN__ ? { stage:win.__AWTSMOOS_FPS_GUARDIAN__.stage, config:win.__AWTSMOOS_FPS_GUARDIAN__.config, avgFps:win.__AWTSMOOS_FPS_GUARDIAN__.avgFps, minFps:win.__AWTSMOOS_FPS_GUARDIAN__.minFps, stable60:win.__AWTSMOOS_FPS_GUARDIAN__.stable60, history:win.__AWTSMOOS_FPS_GUARDIAN__.history } : null
  };
  win.__AWTSMOOS_POST_LOAD_FPS_REPORT__ = result;
  return result;
}

export function bootPostLoadFpsProbe(win = globalThis.window) {
  if (!win || win.__AWTSMOOS_POST_LOAD_FPS_PROBE__) return win?.__AWTSMOOS_POST_LOAD_FPS_PROBE__;
  const state = { waiting:true, started:false, frames:[], last:0, start:0, lastLog:0 };
  win.__AWTSMOOS_POST_LOAD_FPS_PROBE__ = state;
  console.info("B'H FPS Probe: waiting for full game load before sampling.");
  const wait = () => sceneReady(win) ? setTimeout(start, QUIET_MS) : setTimeout(wait, 250);
  const start = () => { state.waiting = false; state.started = true; state.start = now(); state.last = state.start; state.lastLog = state.start; console.info("B'H FPS Probe: post-load sampling started", { quietMs:QUIET_MS, sampleMs:SAMPLE_MS, targetFps:TARGET_FPS }); requestAnimationFrame(tick); };
  const tick = t => {
    const dt = t - state.last; state.last = t;
    if (dt > 0 && dt < 250) state.frames.push(dt);
    if (t - state.lastLog >= LOG_EVERY_MS) { state.lastLog = t; const partial = report(win, state.frames); console.table({ avgFps:partial.avgFps, minFps:partial.minFps, p95FrameMs:partial.p95FrameMs, stable60:partial.stable60, frames:partial.sampleFrames }); }
    if (t - state.start < SAMPLE_MS) requestAnimationFrame(tick);
    else { const final = report(win, state.frames); console.info("B'H FPS Probe final post-load report", final); console.table(final); assertPostLoadFps(final); }
  };
  wait();
  return state;
}

bootPostLoadFpsProbe();
export default bootPostLoadFpsProbe;
