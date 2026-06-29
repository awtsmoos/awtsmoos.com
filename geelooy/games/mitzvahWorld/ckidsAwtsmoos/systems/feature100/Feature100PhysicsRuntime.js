// B"H
/** Feature100PhysicsRuntime: budget-safe physics feature contracts. */
import { mutateFeature100State, appendFeature100Event } from './Feature100State.js';
function remember(bucket, key, value) { return mutateFeature100State(s => { s[bucket] ||= {}; s[bucket][key] = { ...(s[bucket][key] || {}), ...value, at: Date.now() }; return s; }); }
export function cloth(id = 'cloth', detail = {}) { appendFeature100Event({ domain:'physics', action:'cloth', id, detail }); return remember('physics', id, { action:'cloth', detail }); }
export function rope(id = 'rope', detail = {}) { appendFeature100Event({ domain:'physics', action:'rope', id, detail }); return remember('physics', id, { action:'rope', detail }); }
export function current(id = 'current', detail = {}) { appendFeature100Event({ domain:'physics', action:'current', id, detail }); return remember('physics', id, { action:'current', detail }); }
export function turbulence(id = 'turbulence', detail = {}) { appendFeature100Event({ domain:'physics', action:'turbulence', id, detail }); return remember('physics', id, { action:'turbulence', detail }); }
export function snow(id = 'snow', detail = {}) { appendFeature100Event({ domain:'physics', action:'snow', id, detail }); return remember('physics', id, { action:'snow', detail }); }
export function mud(id = 'mud', detail = {}) { appendFeature100Event({ domain:'physics', action:'mud', id, detail }); return remember('physics', id, { action:'mud', detail }); }
export function sand(id = 'sand', detail = {}) { appendFeature100Event({ domain:'physics', action:'sand', id, detail }); return remember('physics', id, { action:'sand', detail }); }
export function footprint(id = 'footprint', detail = {}) { appendFeature100Event({ domain:'physics', action:'footprint', id, detail }); return remember('physics', id, { action:'footprint', detail }); }
export function stack(id = 'stack', detail = {}) { appendFeature100Event({ domain:'physics', action:'stack', id, detail }); return remember('physics', id, { action:'stack', detail }); }
export function collapse(id = 'collapse', detail = {}) { appendFeature100Event({ domain:'physics', action:'collapse', id, detail }); return remember('physics', id, { action:'collapse', detail }); }
export function physicsSnapshot(state = {}) { return state['physics'] || {}; }
export default { cloth, rope, current, turbulence, snow, mud, sand, footprint, stack, collapse, physicsSnapshot };
