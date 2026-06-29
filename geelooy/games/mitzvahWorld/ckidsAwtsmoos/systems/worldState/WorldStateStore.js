// B"H
/**
 * WorldStateStore
 *
 * Chapter of the missing vessel export:
 * The world was black not because the world was empty, but because the core
 * vessel asked for `ensureWorldState` and `worldStateSnapshot`, and the ark did
 * not answer. Now the store speaks both old and new names so Olam can load.
 */
const KEY = 'mitzvahWorld.worldState';
const fallbackMemory = { value:null };
function storage() { try { return globalThis.localStorage || null; } catch { return null; } }
function clone(value) { return JSON.parse(JSON.stringify(value ?? {})); }
function baseState() { return { version:2, createdAt:Date.now(), updatedAt:Date.now(), player:{}, worlds:{}, livingWorld:null, flags:{}, events:[] }; }
export function loadWorldState() { try { const raw = storage()?.getItem?.(KEY); fallbackMemory.value = raw ? JSON.parse(raw) : fallbackMemory.value; } catch {} return { ...baseState(), ...(fallbackMemory.value || {}) }; }
export function saveWorldState(state = {}) { const next = { ...baseState(), ...clone(state), updatedAt:Date.now() }; fallbackMemory.value = next; try { storage()?.setItem?.(KEY, JSON.stringify(next)); } catch {} return next; }
export function mutateWorldState(fn) { const state = loadWorldState(); return saveWorldState(fn?.(state) || state); }
export function patchWorldState(patch = {}) { return mutateWorldState(state => ({ ...state, ...patch })); }
export function readWorldState(key = null, fallback = undefined) { const state = loadWorldState(); return key == null ? state : (state[key] ?? fallback); }
export function writeWorldState(state = {}) { return saveWorldState(state); }
export function updateWorldState(fn) { return mutateWorldState(fn); }
export function getWorldState(key, fallback = undefined) { return readWorldState(key, fallback); }
export function setWorldState(key, value) { return mutateWorldState(state => { state[key] = value; return state; }); }
<<<<<<< HEAD
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
=======
export function ensureWorldState(target = globalThis) { const state = loadWorldState(); if (target && typeof target === 'object') { target.__awtsmoosWorldState ||= state; target.__awtsmoosWorldState.updatedAt = Date.now(); return target.__awtsmoosWorldState; } globalThis.__awtsmoosWorldState ||= state; return globalThis.__awtsmoosWorldState; }
export function worldStateSnapshot(target = globalThis) { const state = target?.__awtsmoosWorldState || loadWorldState(); return clone({ updatedAt:state.updatedAt, player:state.player || {}, livingWorld:state.livingWorld || null, flags:state.flags || {}, events:(state.events || []).slice(-20) }); }
export function recordWorldStateEvent(event = {}) { return mutateWorldState(state => { state.events = [...(state.events || []), { ...event, at:Date.now() }].slice(-80); return state; }); }
export default { loadWorldState, saveWorldState, mutateWorldState, patchWorldState, readWorldState, writeWorldState, updateWorldState, getWorldState, setWorldState, ensureWorldState, worldStateSnapshot, recordWorldStateEvent };
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
