// B"H
/**
 * @file LivingWorldUiPulse.js
 * @description
 * A small budgeted pulse vessel for the living-world UI. The Awtsmoos gives the
 * village a heartbeat without chaining it to every frame: worker gameplay FPS
 * and living-world mutation events may knock, but already-rendered visible
 * payload events are treated as output, not another input, so the vessel does
 * not echo itself forever.
 */
const DEFAULT_MIN_MS = 1500;
const FORCE_REASONS = new Set(["event", "forced", "manual", "visible-bridge", "initial", "after-install"]);
const DEFAULT_EVENTS = Object.freeze(["awtsmoos:worker-gameplay-fps", "mitzvah-world:living-world", "visibilitychange"]);

function now(scope) {
  return Number(scope?.performance?.now?.() || Date.now());
}
function stateOf(scope) {
  scope.__MITZVAH_LIVING_WORLD_UI_PULSE__ ||= {
    installedAt: now(scope), minIntervalMs: DEFAULT_MIN_MS, lastAt: 0,
    lastReason: "never", count: 0, skipped: 0, missingRenderer: 0,
    listeners: [], lastSkippedReason: "none"
  };
  return scope.__MITZVAH_LIVING_WORLD_UI_PULSE__;
}
function forced(reason, options = {}) {
  if (options.force === true) return true;
  if (FORCE_REASONS.has(String(reason))) return true;
  return String(reason || "").includes("event");
}
function safeReason(reason) {
  return String(reason || "unspecified").slice(0, 80);
}
function removeOldListeners(scope, state) {
  for (const item of state.listeners || []) {
    try { scope.removeEventListener?.(item.type, item.handler); } catch (_) {}
  }
  state.listeners = [];
}
function listen(scope, state, type, handler) {
  scope.addEventListener?.(type, handler);
  state.listeners.push({ type, handler });
}
export function requestLivingWorldUiPulse(scope = globalThis, reason = "manual", options = {}) {
  const state = stateOf(scope);
  const at = now(scope), minMs = Number(options.minIntervalMs ?? state.minIntervalMs ?? DEFAULT_MIN_MS);
  state.minIntervalMs = Math.max(250, Math.min(5000, minMs));
  const force = forced(reason, options);
  const renderer = scope.__MITZVAH_RENDER_LIVING_WORLD__;
  if (typeof renderer !== "function") {
    state.skipped += 1; state.missingRenderer += 1; state.lastSkippedReason = "missing-renderer"; state.lastReason = safeReason(reason);
    return createLivingWorldUiPulseSummary(scope);
  }
  if (!force && state.lastAt && at - state.lastAt < state.minIntervalMs) {
    state.skipped += 1; state.lastSkippedReason = "throttled"; state.lastReason = safeReason(reason);
    return createLivingWorldUiPulseSummary(scope);
  }
  const result = renderer({ reason:safeReason(reason), pulseCount:state.count + 1 });
  state.count += 1; state.lastAt = at; state.lastReason = safeReason(reason); state.lastResult = result; state.lastSkippedReason = "none";
  return createLivingWorldUiPulseSummary(scope);
}
export function createLivingWorldUiPulseSummary(scope = globalThis) {
  const state = stateOf(scope);
  return {
    installedAt: state.installedAt,
    minIntervalMs: state.minIntervalMs,
    lastAt: state.lastAt,
    lastReason: state.lastReason,
    count: state.count,
    skipped: state.skipped,
    missingRenderer: state.missingRenderer,
    lastSkippedReason: state.lastSkippedReason
  };
}
export function installLivingWorldUiPulse(scope = globalThis, options = {}) {
  const state = stateOf(scope);
  removeOldListeners(scope, state);
  state.minIntervalMs = Math.max(250, Math.min(5000, Number(options.minIntervalMs || DEFAULT_MIN_MS)));
  const events = options.events || DEFAULT_EVENTS;
  for (const type of events) {
    if (type === "mitzvah-world:visible-payload") continue;
    listen(scope, state, type, event => {
      const forcedEvent = type === "mitzvah-world:living-world" || type === "visibilitychange";
      if (type === "visibilitychange" && scope.document?.hidden) return;
      requestLivingWorldUiPulse(scope, event?.detail?.reason || type, { force:forcedEvent });
    });
  }
  scope.__MITZVAH_REQUEST_LIVING_WORLD_UI_PULSE__ = reason => requestLivingWorldUiPulse(scope, reason);
  scope.__MITZVAH_LIVING_WORLD_UI_PULSE_SUMMARY__ = () => createLivingWorldUiPulseSummary(scope);
  if (options.immediate !== false) requestLivingWorldUiPulse(scope, options.reason || "after-install", { force:true });
  return createLivingWorldUiPulseSummary(scope);
}
export default { installLivingWorldUiPulse, requestLivingWorldUiPulse, createLivingWorldUiPulseSummary };
