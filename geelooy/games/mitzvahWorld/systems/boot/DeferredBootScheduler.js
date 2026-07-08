// B"H
/**
 * @file DeferredBootScheduler.js
 * @description Loads noncritical systems only after the playable world is proven.
 */

const scope = globalThis;
const state = scope.__MITZVAH_DEFERRED_BOOT__ ||= {
  seal: "post-ready-fast-loader-20260706-bh1",
  startedAt: Date.now(),
  loaded: [],
  failed: []
};

export const coreQueue = Object.freeze([
  ["fps-guardian", "../performance/FpsGuardian.js?compact=true&v=fps-guardian-default-core-20260706-bh2", 150],
  ["unified-dream-spine", "../dream/UnifiedMitzvahWorldDreamBootstrap.js?compact=true&v=one-world-dream-20260706-bh2", 450],
  ["animal-proof", "../dream/AnimalProofBootstrap.js?compact=true&v=wildlife-proof-scanner-20260706-bh2", 1200]
]);

export const extrasQueue = Object.freeze([
  ["ancient-scroll-ui", "../ui/AncientScrollUiPolish.js?compact=true&v=step-by-step-20260706-bh2", 3000],
  ["realism-fast-fps", "../realism/RealismFastFpsBootstrap.js?compact=true&v=master-realism-fast-fps-20260706-bh2", 8000],
  ["world-memory", "../worldMemory/WorldMemoryBootstrap.js?compact=true&v=full-hyperrealism-step-20260706-bh2", 15000],
  ["story", "../story/StoryBootstrap.js?compact=true&v=texture-pingpong-story-20260706-bh2", 23000],
  ["living-world", "../realism/LivingWorldBootstrap.js?compact=true&v=living-world-hyperrealism-20260706-bh2", 40000]
]);

function extrasEnabled() {
  try {
    return new URLSearchParams(scope.location?.search || "").get("dreamExtras") === "true";
  } catch {
    return false;
  }
}

function emit(name, detail) {
  try {
    scope.dispatchEvent?.(new CustomEvent(name, { detail }));
  } catch {}
}

function mark(kind, name, extra = {}) {
  const row = { name, at: Date.now(), ...extra };
  state[kind].push(row);
  emit(`mitzvah-world:deferred-boot-${kind}`, row);
}

function idle(fn, timeout = 1800) {
  return scope.requestIdleCallback
    ? scope.requestIdleCallback(fn, { timeout })
    : scope.setTimeout(fn, Math.min(timeout, 700));
}

async function loadOne([name, spec]) {
  try {
    await import(spec);
    mark("loaded", name, { spec });
  } catch (error) {
    console.warn("B'H deferred boot failed", name, error);
    mark("failed", name, { spec, error: String(error?.message || error) });
  }
}

function schedule(task) {
  scope.setTimeout(() => idle(() => loadOne(task), 2600), task[2] || 0);
}

/**
 * B"H
 * Starts post-ready boot work. This must not compete with first playable load.
 *
 * @returns {object} Deferred boot state.
 */
export function start() {
  if (state.scheduled) return state;
  state.scheduled = true;
  state.extrasEnabled = extrasEnabled();
  const queue = state.extrasEnabled ? [...coreQueue, ...extrasQueue] : [...coreQueue];
  state.queue = queue.map(([name]) => name);
  queue.forEach(schedule);
  return state;
}

function startWhenReady() {
  if (scope.__AWTSMOOS_BOOT_LOADED__ || scope.__AWTSMOOS_LOADING_FINAL_READY__?.playable) start();
}

scope.addEventListener?.("awtsmoos-game-ready", start, { once: true });
scope.setTimeout(startWhenReady, 1200);
scope.setTimeout(start, 22000);

export default state;
