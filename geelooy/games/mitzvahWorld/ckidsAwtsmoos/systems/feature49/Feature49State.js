// B"H
/** Feature49State: tiny persistent deltas for a living village. */
const KEY = 'mitzvahWorld.feature49.state';
export function loadFeature49State(){ try{return JSON.parse(globalThis.localStorage?.getItem?.(KEY)||'{}')||{};}catch{return {};} }
export function saveFeature49State(state={}){ state.updatedAt=Date.now(); globalThis.localStorage?.setItem?.(KEY,JSON.stringify(state)); return state; }
export function patchFeature49State(patch={}){ return saveFeature49State({ ...loadFeature49State(), ...patch }); }
export function mutateFeature49State(fn){ const state=loadFeature49State(); return saveFeature49State(fn?.(state)||state); }
export function listFeature49Log(limit=30){ return (loadFeature49State().log||[]).slice(-limit); }
export function appendFeature49Log(event){ return mutateFeature49State(s=>{ s.log ||= []; s.log.push({ ...event, at:Date.now() }); s.log=s.log.slice(-240); return s; }); }
export default { loadFeature49State, saveFeature49State, patchFeature49State, mutateFeature49State, appendFeature49Log, listFeature49Log };
