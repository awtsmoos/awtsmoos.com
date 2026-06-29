// B"H
/**
 * WorldStateStore
 *
 * The core vessel and newer starter systems use different property names. This
 * store keeps both names pointing at the same world state so boot and audits
 * agree.
 */
const KEY = "mitzvahWorld.worldState";
const fallbackMemory = { value:null };

function storage() { try { return globalThis.localStorage || null; } catch { return null; } }
function clone(value) { return JSON.parse(JSON.stringify(value ?? {})); }
function baseState() { return { version:2, createdAt:Date.now(), updatedAt:Date.now(), player:{}, worlds:{}, livingWorld:null, flags:{}, events:[] }; }

export function loadWorldState() {
  try {
    const raw = storage()?.getItem?.(KEY);
    fallbackMemory.value = raw ? JSON.parse(raw) : fallbackMemory.value;
  } catch {}
  return { ...baseState(), ...(fallbackMemory.value || {}) };
}

export function saveWorldState(state = {}) {
  const next = { ...baseState(), ...clone(state), updatedAt:Date.now() };
  fallbackMemory.value = next;
  try { storage()?.setItem?.(KEY, JSON.stringify(next)); } catch {}
  return next;
}

export function mutateWorldState(fn) { const state = loadWorldState(); return saveWorldState(fn?.(state) || state); }
export function patchWorldState(patch = {}) { return mutateWorldState(state => ({ ...state, ...patch })); }
export function readWorldState(key = null, fallback = undefined) { const state = loadWorldState(); return key == null ? state : (state[key] ?? fallback); }
export function writeWorldState(state = {}) { return saveWorldState(state); }
export function updateWorldState(fn) { return mutateWorldState(fn); }
export function getWorldState(key, fallback = undefined) { return readWorldState(key, fallback); }
export function setWorldState(key, value) { return mutateWorldState(state => { state[key] = value; return state; }); }

export function ensureWorldState(target = globalThis) {
  const state = target?.worldState || target?.__awtsmoosWorldState || loadWorldState();
  state.updatedAt ||= Date.now();
  if (target && typeof target === "object") {
    target.worldState = state;
    target.__awtsmoosWorldState = state;
    return state;
  }
  globalThis.worldState = state;
  globalThis.__awtsmoosWorldState = state;
  return state;
}

export function worldStateSnapshot(target = globalThis) {
  const state = target?.worldState || target?.__awtsmoosWorldState || loadWorldState();
  return clone({ ...state, keys:Object.keys(state), updatedAt:state.updatedAt || 0, events:(state.events || []).slice(-20) });
}

export function recordWorldStateEvent(event = {}) {
  return mutateWorldState(state => {
    state.events = [...(state.events || []), { ...event, at:Date.now() }].slice(-80);
    return state;
  });
}

export default { loadWorldState, saveWorldState, mutateWorldState, patchWorldState, readWorldState, writeWorldState, updateWorldState, getWorldState, setWorldState, ensureWorldState, worldStateSnapshot, recordWorldStateEvent };
