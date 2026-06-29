// B"H
/**
 * WorldStateStore
 * The Awtsmoos preserves tiny world deltas without polling the whole creation.
 * Compatibility exports are kept for existing worker/world imports.
 */
const KEY = 'mitzvahWorld.worldState';
function storage() { return globalThis.localStorage || null; }
export function loadWorldState() {
  try { return JSON.parse(storage()?.getItem?.(KEY) || '{}') || {}; }
  catch { return {}; }
}
export function saveWorldState(state = {}) {
  storage()?.setItem?.(KEY, JSON.stringify(state));
  return state;
}
export function mutateWorldState(fn) {
  const state = loadWorldState();
  const next = fn?.(state) || state;
  next.updatedAt = Date.now();
  return saveWorldState(next);
}
export function patchWorldState(patch = {}) {
  return mutateWorldState(state => ({ ...state, ...patch }));
}
export function readWorldState(key = null, fallback = undefined) {
  const state = loadWorldState();
  return key == null ? state : (state[key] ?? fallback);
}
export function writeWorldState(state = {}) { return saveWorldState(state); }
export function updateWorldState(fn) { return mutateWorldState(fn); }
export function getWorldState(key, fallback = undefined) { return readWorldState(key, fallback); }
export function setWorldState(key, value) { return mutateWorldState(state => { state[key] = value; return state; }); }
export function ensureWorldState(target = {}) {
  target.worldState ||= loadWorldState();
  target.worldState.updatedAt ||= Date.now();
  return target.worldState;
}
export function worldStateSnapshot(target = {}) {
  const state = target.worldState || loadWorldState();
  return { ...state, keys:Object.keys(state), updatedAt:state.updatedAt || 0 };
}
export default { loadWorldState, saveWorldState, mutateWorldState, patchWorldState, readWorldState, writeWorldState, updateWorldState, getWorldState, setWorldState, ensureWorldState, worldStateSnapshot };
