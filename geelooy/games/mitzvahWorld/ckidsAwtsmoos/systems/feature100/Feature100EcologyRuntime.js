// B"H
/** Feature100EcologyRuntime: budget-safe ecology feature contracts. */
import { mutateFeature100State, appendFeature100Event } from './Feature100State.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function remember(bucket, key, value) { return mutateFeature100State(s => { s[bucket] ||= {}; s[bucket][key] = { ...(s[bucket][key] || {}), ...value, at: Date.now() }; return s; }); }
export function predatorPrey(id = 'predatorPrey', detail = {}) { appendFeature100Event({ domain:'ecology', action:'predatorPrey', id, detail }); return remember('ecology', id, { action:'predatorPrey', detail }); }
export function insects(id = 'insects', detail = {}) { appendFeature100Event({ domain:'ecology', action:'insects', id, detail }); return remember('ecology', id, { action:'insects', detail }); }
export function pollinate(id = 'pollinate', detail = {}) { appendFeature100Event({ domain:'ecology', action:'pollinate', id, detail }); return remember('ecology', id, { action:'pollinate', detail }); }
export function succession(id = 'succession', detail = {}) { appendFeature100Event({ domain:'ecology', action:'succession', id, detail }); return remember('ecology', id, { action:'succession', detail }); }
export function fertility(id = 'fertility', detail = {}) { appendFeature100Event({ domain:'ecology', action:'fertility', id, detail }); return remember('ecology', id, { action:'fertility', detail }); }
export function territory(id = 'territory', detail = {}) { appendFeature100Event({ domain:'ecology', action:'territory', id, detail }); return remember('ecology', id, { action:'territory', detail }); }
export function migrate(id = 'migrate', detail = {}) { appendFeature100Event({ domain:'ecology', action:'migrate', id, detail }); return remember('ecology', id, { action:'migrate', detail }); }
export function river(id = 'river', detail = {}) { appendFeature100Event({ domain:'ecology', action:'river', id, detail }); return remember('ecology', id, { action:'river', detail }); }
export function erosion(id = 'erosion', detail = {}) { appendFeature100Event({ domain:'ecology', action:'erosion', id, detail }); return remember('ecology', id, { action:'erosion', detail }); }
export function fireCycle(id = 'fireCycle', detail = {}) { appendFeature100Event({ domain:'ecology', action:'fireCycle', id, detail }); return remember('ecology', id, { action:'fireCycle', detail }); }
export function ecologySnapshot(state = {}) { return state['ecology'] || {}; }
export default { predatorPrey, insects, pollinate, succession, fertility, territory, migrate, river, erosion, fireCycle, ecologySnapshot };
