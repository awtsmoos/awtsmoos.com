// B"H
/** @file WorldStateAudit.js @description Shape audit for persistent world state. */
import { ensureWorldState } from "./WorldStateStore.js";
function plain(value) { return !value || typeof value !== "object" || (!value.isObject3D && !value.geometry && !value.material); }
function scan(value, path = "state", issues = []) { if (!plain(value)) issues.push({ path, issue:"runtime-object-in-state" }); if (!value || typeof value !== "object") return issues; for (const [k,v] of Object.entries(value)) scan(v, `${path}.${k}`, issues); return issues; }
export function runWorldStateAudit(olam = {}) { const state = ensureWorldState(olam), issues = scan(state); for (const [id,door] of Object.entries(state.doors || {})) if (!door.id && !id) issues.push({ path:`doors.${id}`, issue:"door-without-id" }); for (const [id,house] of Object.entries(state.houses || {})) if (!house.id && !id) issues.push({ path:`houses.${id}`, issue:"house-without-id" }); return { ok:issues.length === 0, issues, keys:Object.keys(state), doors:Object.keys(state.doors || {}).length, houses:Object.keys(state.houses || {}).length }; }
export default runWorldStateAudit;
