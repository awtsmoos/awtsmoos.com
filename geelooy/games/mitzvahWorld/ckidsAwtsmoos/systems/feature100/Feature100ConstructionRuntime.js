// B"H
/** Feature100ConstructionRuntime: budget-safe construction feature contracts. */
import { mutateFeature100State, appendFeature100Event } from './Feature100State.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function remember(bucket, key, value) { return mutateFeature100State(s => { s[bucket] ||= {}; s[bucket][key] = { ...(s[bucket][key] || {}), ...value, at: Date.now() }; return s; }); }
export function road(id = 'road', detail = {}) { appendFeature100Event({ domain:'construction', action:'road', id, detail }); return remember('construction', id, { action:'road', detail }); }
export function path(id = 'path', detail = {}) { appendFeature100Event({ domain:'construction', action:'path', id, detail }); return remember('construction', id, { action:'path', detail }); }
export function bridge(id = 'bridge', detail = {}) { appendFeature100Event({ domain:'construction', action:'bridge', id, detail }); return remember('construction', id, { action:'bridge', detail }); }
export function maintenance(id = 'maintenance', detail = {}) { appendFeature100Event({ domain:'construction', action:'maintenance', id, detail }); return remember('construction', id, { action:'maintenance', detail }); }
export function roof(id = 'roof', detail = {}) { appendFeature100Event({ domain:'construction', action:'roof', id, detail }); return remember('construction', id, { action:'roof', detail }); }
export function expand(id = 'expand', detail = {}) { appendFeature100Event({ domain:'construction', action:'expand', id, detail }); return remember('construction', id, { action:'expand', detail }); }
export function identity(id = 'identity', detail = {}) { appendFeature100Event({ domain:'construction', action:'identity', id, detail }); return remember('construction', id, { action:'identity', detail }); }
export function garden(id = 'garden', detail = {}) { appendFeature100Event({ domain:'construction', action:'garden', id, detail }); return remember('construction', id, { action:'garden', detail }); }
export function storage(id = 'storage', detail = {}) { appendFeature100Event({ domain:'construction', action:'storage', id, detail }); return remember('construction', id, { action:'storage', detail }); }
export function irrigation(id = 'irrigation', detail = {}) { appendFeature100Event({ domain:'construction', action:'irrigation', id, detail }); return remember('construction', id, { action:'irrigation', detail }); }
export function constructionSnapshot(state = {}) { return state['construction'] || {}; }
export default { road, path, bridge, maintenance, roof, expand, identity, garden, storage, irrigation, constructionSnapshot };
