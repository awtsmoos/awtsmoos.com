// B"H
/** @file DeathRuntime.js @description Solo death state: defeat becomes a corpse-run story, not a multiplayer wall. */
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function clonePos(mesh) { const p = mesh?.position || {}; return { x:Number(p.x || 0), y:Number(p.y || 0), z:Number(p.z || 0) }; }
export function ensureDeathState(olam) { const p = playerOf(olam); if (!p) return null; p.deathState ||= { dead:false, ghost:false, graveyard:"village_graveyard", corpse:null }; return p.deathState; }
export function markPlayerDead(olam, reason = "defeated") { const p = playerOf(olam), s = ensureDeathState(olam); if (!p || !s) return false; s.dead = true; s.ghost = true; s.reason = reason; s.corpse = clonePos(p.mesh); p.hp = 1; olam?.ayshPeula?.("ui event", "deathState", s); return s; }
export function resurrectAtCorpse(olam) { const p = playerOf(olam), s = ensureDeathState(olam); if (!p || !s?.corpse) return false; if (p.mesh?.position?.set) p.mesh.position.set(s.corpse.x, s.corpse.y, s.corpse.z); s.dead = false; s.ghost = false; p.hp = Math.max(1, Math.floor(Number(p.maxHp || 100) * .5)); olam?.ayshPeula?.("ui event", "deathState", s); return s; }
export default { ensureDeathState, markPlayerDead, resurrectAtCorpse };
