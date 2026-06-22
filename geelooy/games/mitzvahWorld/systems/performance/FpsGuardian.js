// B"H
/**
 * @file FpsGuardian.js
 * @description Runtime 60 FPS guardian for the rich world route.
 *
 * Gameplay stays present. The guardian changes representation cost: shadows,
 * visual tick cadence, accent meshes, and far cosmetic detail.
 */
const KEY = "__AWTSMOOS_FPS_GUARDIAN__";
const TARGET = 60;
const LOW = 57;
const HIGH = 62;
const WINDOW = 90;
const STAGES = [
  { name:"full-wow-gameplay", wildlifeTickSec:.18, visualTickSec:.35, movieTickSec:1 / 60, accents:true, farInteriors:true, shadows:true },
  { name:"steady-rich", wildlifeTickSec:.24, visualTickSec:.5, movieTickSec:1 / 60, accents:true, farInteriors:true, shadows:false },
  { name:"instanced-rich", wildlifeTickSec:.32, visualTickSec:.7, movieTickSec:1 / 60, accents:false, farInteriors:true, shadows:false },
  { name:"gameplay-first-rich", wildlifeTickSec:.45, visualTickSec:1.0, movieTickSec:1 / 60, accents:false, farInteriors:false, shadows:false },
  { name:"locked-60-gameplay", wildlifeTickSec:.62, visualTickSec:1.35, movieTickSec:1 / 60, accents:false, farInteriors:false, shadows:false }
];

function olamOf(win) { return win.__AWTSMOOS_OLAM__ || win.olam || win.ikar?.olam || win.mana?.activeOlam || null; }
function rendererOf(win) { return win.__AWTSMOOS_RENDERER__ || win.renderer || olamOf(win)?.renderer || null; }
function sceneOf(win) { return olamOf(win)?.scene || win.scene || win.__AWTSMOOS_SCENE__ || null; }
function avg(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0; }
function fpsOf(ms) { return 1000 / Math.max(.001, ms); }
function mats(object) { const m = object?.material; return Array.isArray(m) ? m : m ? [m] : []; }

function setTextureBias(scene, stage) {
  const anisotropy = stage >= 3 ? 4 : stage >= 2 ? 8 : 16;
  scene?.traverse?.(object => {
    for (const material of mats(object)) {
      for (const key of ["map", "normalMap", "roughnessMap", "aoMap", "emissiveMap"]) {
        const texture = material[key];
        if (!texture) continue;
        texture.anisotropy = Math.max(anisotropy, Number(texture.anisotropy) || 0);
        texture.needsUpdate = true;
      }
    }
  });
}

function setVisualLod(scene, config) {
  scene?.traverse?.(object => {
    const name = String(object?.name || "");
    const data = object?.userData || {};
    if (name.includes("leaf_distribution_accents")) object.visible = config.accents;
    if (data.cottageInteriorSystem && object.parent?.parent?.children?.indexOf?.(object.parent) > 5) object.visible = config.farInteriors;
    if (object.isLight && /lens|flare|spark|accent/i.test(name)) object.visible = config.accents;
  });
}

function applyStage(win, state, stage) {
  const config = STAGES[stage] || STAGES[STAGES.length - 1];
  const renderer = rendererOf(win), scene = sceneOf(win), root = win.document?.documentElement;
  if (renderer?.shadowMap) renderer.shadowMap.enabled = config.shadows;
  root?.classList?.toggle("awtsmoos-fps-guardian-active", stage > 0);
  root?.setAttribute?.("data-awtsmoos-fps-stage", config.name);
  setVisualLod(scene, config);
  setTextureBias(scene, stage);
  state.stage = stage;
  state.config = config;
  state.appliedAt = Date.now();
  state.history.push({ at:state.appliedAt, stage, name:config.name, avgFps:state.avgFps });
  state.history = state.history.slice(-12);
  win.dispatchEvent?.(new CustomEvent("awtsmoos:fps-guardian-stage", { detail:{ stage, config } }));
}

function maybeAdapt(win, state) {
  if (state.samples.length < WINDOW) return;
  const recent = state.samples.slice(-WINDOW), fps = recent.map(fpsOf), average = avg(fps);
  state.avgFps = Number(average.toFixed(2));
  state.minFps = Number(Math.min(...fps).toFixed(2));
  state.stable60 = fps.every(v => v >= TARGET);
  const now = performance.now();
  if (now - state.lastAdapt < 1800) return;
  if (average < LOW && state.stage < STAGES.length - 1) {
    state.lastAdapt = now;
    applyStage(win, state, state.stage + 1);
  } else if (average > HIGH && state.stage > 0) {
    state.lastAdapt = now;
    applyStage(win, state, state.stage - 1);
  }
}

export function bootFpsGuardian(win = globalThis.window) {
  if (!win) return null;
  if (win[KEY]) return win[KEY];
  const state = { targetFps:TARGET, stage:0, config:STAGES[0], samples:[], avgFps:0, minFps:0, stable60:false, last:0, lastAdapt:0, history:[] };
  win[KEY] = state;
  applyStage(win, state, 0);
  const tick = time => {
    if (state.last) {
      const dt = time - state.last;
      if (dt > 0 && dt < 250) state.samples.push(dt);
      if (state.samples.length > WINDOW * 4) state.samples.splice(0, state.samples.length - WINDOW * 4);
      maybeAdapt(win, state);
    }
    state.last = time;
    win.requestAnimationFrame(tick);
  };
  win.requestAnimationFrame(tick);
  return state;
}

bootFpsGuardian();
export default bootFpsGuardian;
