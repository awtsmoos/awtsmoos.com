// B"H
/**
 * @file RealismPerformanceGovernor.js
 * @description
 * Chapter 920: Realism becomes selective instead of expensive. The Awtsmoos
 * reveals a world where close souls breathe richly, distant souls dream in
 * cheaper rhythms, and the frame never bends beneath vanity.
 */
const SEAL = "selective-realism-governor-20260624-bh1";
const LEVELS = Object.freeze([
  { name:"cinematic", minFps:72, maxP99:16.9, scale:1.08 },
  { name:"realistic", minFps:60, maxP99:22, scale:1 },
  { name:"steady", minFps:52, maxP99:34, scale:.82 },
  { name:"rescue", minFps:0, maxP99:1e9, scale:.58 }
]);
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
function chooseLevel(frame = {}) {
  const fps = Number(frame.fps || 0), p99 = Number(frame.p99FrameMs || frame.p95FrameMs || 16.7);
  const longFrames = Number(frame.longFrames || 0);
  if (longFrames > 2 || p99 > 40) return LEVELS[3];
  return LEVELS.find(level => fps >= level.minFps && p99 <= level.maxP99) || LEVELS.at(-1);
}
function buildBudget(level, frame = {}) {
  const s = level.scale;
  const p99 = Number(frame.p99FrameMs || 16.7);
  const pressure = clamp((p99 - 16.7) / 33.3, 0, 1);
  return {
    level: level.name,
    pressure,
    ai: {
      fullMeters: Math.round(24 * s),
      awareMeters: Math.round(70 * s),
      fullHz: clamp(24 * s, 8, 30),
      farHz: clamp(1.2 * s, .25, 2),
      maxThinkMs: +(1.4 * s).toFixed(2)
    },
    animation: {
      fullMeters: Math.round(18 * s),
      halfMeters: Math.round(55 * s),
      farHz: clamp(6 * s, 2, 10),
      proceduralIdle: level.name !== "rescue"
    },
    physics: {
      fullMeters: Math.round(16 * s),
      kinematicMeters: Math.round(62 * s),
      maxCollisionMs: +(1.2 * s).toFixed(2)
    },
    ambience: {
      maxEmitters: Math.round(18 * s),
      wildlifeHz: clamp(3 * s, .5, 4),
      weatherDetail: level.name === "cinematic" ? "rich" : level.name === "rescue" ? "minimal" : "balanced"
    },
    ui: {
      hudHz: level.name === "rescue" ? 6 : 12,
      floatingTextHz: level.name === "cinematic" ? 20 : 10,
      allowDecorativeDom: false
    },
    rendering: {
      realismScale: +s.toFixed(2),
      contactShadows: level.name !== "rescue",
      materialVariation: level.name === "cinematic" || level.name === "realistic",
      distantDecals: level.name === "cinematic"
    },
    scheduler: {
      maxTasksPerTick: level.name === "rescue" ? 1 : level.name === "steady" ? 2 : 3,
      maxMsPerTick: +(level.name === "rescue" ? .8 : level.name === "steady" ? 1.2 : 1.8).toFixed(2)
    },
    seal: SEAL
  };
}
export function createRealismPerformanceGovernor(scope = globalThis) {
  const state = { budget: buildBudget(LEVELS[1]), history: [], seal: SEAL };
  function publish(reason = "manual", frame = {}) {
    const level = chooseLevel(frame);
    state.budget = buildBudget(level, frame);
    state.history.push({ at: Date.now(), reason, level: level.name, fps: frame.fps || 0, p99FrameMs: frame.p99FrameMs || 0 });
    state.history = state.history.slice(-24);
    scope.__AWTSMOOS_GAMEPLAY_BUDGET__ = { ...(scope.__AWTSMOOS_GAMEPLAY_BUDGET__ || {}), ...state.budget.scheduler };
    scope.__MITZVAH_WORLD_REALISM_BUDGET__ = state.budget;
    scope.__MITZVAH_WORLD_REALISM_GOVERNOR__ = api;
    scope.dispatchEvent?.(new CustomEvent("mitzvah-world:realism-budget", { detail: { budget: state.budget, history: state.history } }));
    return state.budget;
  }
  function ingestPerformanceBudget(event) {
    const budget = event?.detail?.budget || scope.__MITZVAH_WORLD_PERFORMANCE_BUDGET__ || {};
    const frame = budget.lastFrame || budget.reason || {};
    publish("performance-budget", frame);
  }
  function start() {
    if (state.started) return api;
    state.started = true;
    scope.addEventListener?.("mitzvah-world:performance-budget", ingestPerformanceBudget);
    publish("start", scope.__MITZVAH_WORLD_PERFORMANCE_BUDGET__?.lastFrame || {});
    return api;
  }
  function stop() { state.started = false; scope.removeEventListener?.("mitzvah-world:performance-budget", ingestPerformanceBudget); return api; }
  const api = { state, start, stop, publish, chooseLevel, buildBudget };
  return api;
}
export default createRealismPerformanceGovernor;
