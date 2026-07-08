// B"H
/** Feature100EconomyRuntime: budget-safe economy feature contracts. */
import { mutateFeature100State, appendFeature100Event } from './Feature100State.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function remember(bucket, key, value) { return mutateFeature100State(s => { s[bucket] ||= {}; s[bucket][key] = { ...(s[bucket][key] || {}), ...value, at: Date.now() }; return s; }); }
export function inflate(id = 'inflate', detail = {}) { appendFeature100Event({ domain:'economy', action:'inflate', id, detail }); return remember('economy', id, { action:'inflate', detail }); }
export function shortage(id = 'shortage', detail = {}) { appendFeature100Event({ domain:'economy', action:'shortage', id, detail }); return remember('economy', id, { action:'shortage', detail }); }
export function competition(id = 'competition', detail = {}) { appendFeature100Event({ domain:'economy', action:'competition', id, detail }); return remember('economy', id, { action:'competition', detail }); }
export function specialty(id = 'specialty', detail = {}) { appendFeature100Event({ domain:'economy', action:'specialty', id, detail }); return remember('economy', id, { action:'specialty', detail }); }
export function monopoly(id = 'monopoly', detail = {}) { appendFeature100Event({ domain:'economy', action:'monopoly', id, detail }); return remember('economy', id, { action:'monopoly', detail }); }
export function labor(id = 'labor', detail = {}) { appendFeature100Event({ domain:'economy', action:'labor', id, detail }); return remember('economy', id, { action:'labor', detail }); }
export function bottleneck(id = 'bottleneck', detail = {}) { appendFeature100Event({ domain:'economy', action:'bottleneck', id, detail }); return remember('economy', id, { action:'bottleneck', detail }); }
export function transport(id = 'transport', detail = {}) { appendFeature100Event({ domain:'economy', action:'transport', id, detail }); return remember('economy', id, { action:'transport', detail }); }
export function seasonalPrice(id = 'seasonalPrice', detail = {}) { appendFeature100Event({ domain:'economy', action:'seasonalPrice', id, detail }); return remember('economy', id, { action:'seasonalPrice', detail }); }
export function craftReputation(id = 'craftReputation', detail = {}) { appendFeature100Event({ domain:'economy', action:'craftReputation', id, detail }); return remember('economy', id, { action:'craftReputation', detail }); }
export function economySnapshot(state = {}) { return state['economy'] || {}; }
export default { inflate, shortage, competition, specialty, monopoly, labor, bottleneck, transport, seasonalPrice, craftReputation, economySnapshot };
