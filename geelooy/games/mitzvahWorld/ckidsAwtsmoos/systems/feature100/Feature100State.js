// B"H
/** Feature100State: compact local persistent deltas, never an always-on burden. */
const KEY = 'mitzvahWorld.feature100.state';
export function loadFeature100State(){ try{return JSON.parse(globalThis.localStorage?.getItem?.(KEY)||'{}')||{};}catch{return {};}}
export function saveFeature100State(state={}){ state.updatedAt=Date.now(); globalThis.localStorage?.setItem?.(KEY,JSON.stringify(state)); return state; }
export function mutateFeature100State(fn){ const state=loadFeature100State(); return saveFeature100State(fn?.(state)||state); }
export function appendFeature100Event(event={}){ return mutateFeature100State(s=>{ s.events ||= []; s.events.push({...event,at:Date.now()}); s.events=s.events.slice(-500); return s; }); }
export default { loadFeature100State, saveFeature100State, mutateFeature100State, appendFeature100Event };
