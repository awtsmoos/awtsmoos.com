// B"H
/** @file DeathRuntime.js @description Solo death state with automatic corpse marker and spirit-healer UI emission. */
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function clonePos(mesh) { const p = mesh?.position || {}; return { x:Number(p.x || 0), y:Number(p.y || 0), z:Number(p.z || 0) }; }
function emit(olam, name, payload) { olam?.ayshPeula?.("ui event", name, payload); return payload; }
function corpsePayload(state) { return { hasCorpse:Boolean(state?.corpse), corpse:state?.corpse || null, ghost:Boolean(state?.ghost) }; }
function spiritPayload(state) { return { open:Boolean(state?.ghost), ghost:Boolean(state?.ghost), graveyard:{ id:state?.graveyard || "village_graveyard" }, corpse:{ ok:false, corpse:state?.corpse || null, range:8 }, choices:[{ id:"corpse", label:"Return to corpse", enabled:Boolean(state?.ghost && state?.corpse) }, { id:"spirit", label:"Resurrect at spirit healer", enabled:Boolean(state?.ghost) }] }; }
function emitDeathUi(olam, state, reason) { emit(olam, "deathState", state); emit(olam, "corpseMarker", corpsePayload(state)); emit(olam, "spiritHealer", spiritPayload(state)); emit(olam, "starterZoneHud", { spiritHealer:spiritPayload(state), reason }); return state; }
export function ensureDeathState(olam) { const p = playerOf(olam); if (!p) return null; p.deathState ||= { dead:false, ghost:false, graveyard:"village_graveyard", corpse:null }; return p.deathState; }
export function markPlayerDead(olam, reason = "defeated") { const p = playerOf(olam), s = ensureDeathState(olam); if (!p || !s) return false; s.dead = true; s.ghost = true; s.reason = reason; s.corpse = clonePos(p.mesh); p.hp = 1; return emitDeathUi(olam, s, "player-dead"); }
export function resurrectAtCorpse(olam) { const p = playerOf(olam), s = ensureDeathState(olam); if (!p || !s?.corpse) return false; if (p.mesh?.position?.set) p.mesh.position.set(s.corpse.x, s.corpse.y, s.corpse.z); s.dead = false; s.ghost = false; p.hp = Math.max(1, Math.floor(Number(p.maxHp || 100) * .5)); return emitDeathUi(olam, s, "corpse-resurrect"); }
export default { ensureDeathState, markPlayerDead, resurrectAtCorpse };
