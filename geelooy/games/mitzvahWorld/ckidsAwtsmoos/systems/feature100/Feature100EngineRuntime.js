// B"H
/** Feature100EngineRuntime: budget-safe engine feature contracts. */
import { mutateFeature100State, appendFeature100Event } from './Feature100State.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function remember(bucket, key, value) { return mutateFeature100State(s => { s[bucket] ||= {}; s[bucket][key] = { ...(s[bucket][key] || {}), ...value, at: Date.now() }; return s; }); }
export function island(id = 'island', detail = {}) { appendFeature100Event({ domain:'engine', action:'island', id, detail }); return remember('engine', id, { action:'island', detail }); }
export function schedule(id = 'schedule', detail = {}) { appendFeature100Event({ domain:'engine', action:'schedule', id, detail }); return remember('engine', id, { action:'schedule', detail }); }
export function aiResolution(id = 'aiResolution', detail = {}) { appendFeature100Event({ domain:'engine', action:'aiResolution', id, detail }); return remember('engine', id, { action:'aiResolution', detail }); }
export function lod(id = 'lod', detail = {}) { appendFeature100Event({ domain:'engine', action:'lod', id, detail }); return remember('engine', id, { action:'lod', detail }); }
export function stream(id = 'stream', detail = {}) { appendFeature100Event({ domain:'engine', action:'stream', id, detail }); return remember('engine', id, { action:'stream', detail }); }
export function vegetation(id = 'vegetation', detail = {}) { appendFeature100Event({ domain:'engine', action:'vegetation', id, detail }); return remember('engine', id, { action:'vegetation', detail }); }
export function pathJob(id = 'pathJob', detail = {}) { appendFeature100Event({ domain:'engine', action:'pathJob', id, detail }); return remember('engine', id, { action:'pathJob', detail }); }
export function eventNpc(id = 'eventNpc', detail = {}) { appendFeature100Event({ domain:'engine', action:'eventNpc', id, detail }); return remember('engine', id, { action:'eventNpc', detail }); }
export function frameBudget(id = 'frameBudget', detail = {}) { appendFeature100Event({ domain:'engine', action:'frameBudget', id, detail }); return remember('engine', id, { action:'frameBudget', detail }); }
export function replay(id = 'replay', detail = {}) { appendFeature100Event({ domain:'engine', action:'replay', id, detail }); return remember('engine', id, { action:'replay', detail }); }
export function engineSnapshot(state = {}) { return state['engine'] || {}; }
export default { island, schedule, aiResolution, lod, stream, vegetation, pathJob, eventNpc, frameBudget, replay, engineSnapshot };
