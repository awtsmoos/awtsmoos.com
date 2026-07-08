// B"H
/** @file SpiritHealerRuntime.js @description Solo corpse-run recovery: spirit healer panel, corpse range check, graveyard resurrection, and clear HUD choices. */
import { ensureDeathState, resurrectAtCorpse } from "./DeathRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { graveyardById } from "./GraveyardRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function playerOf(olam) { return olam?.player || olam?.chossid || olam || {}; }
function posOf(x) { return x?.mesh?.position || x?.position || x || {}; }
function dist(a, b) { return Math.hypot((posOf(a).x || 0) - (posOf(b).x || 0), (posOf(a).z || 0) - (posOf(b).z || 0)); }
export function canResurrectAtCorpse(olam, range = 8) { const p = playerOf(olam), s = ensureDeathState(olam); return { ok:Boolean(s?.ghost && s?.corpse && dist(p, s.corpse) <= range), distance:s?.corpse ? dist(p, s.corpse) : null, range, corpse:s?.corpse || null }; }
export function spiritHealerPayload(olam) { const s = ensureDeathState(olam), gy = graveyardById(s?.graveyard); const corpse = canResurrectAtCorpse(olam); return { open:Boolean(s?.ghost), ghost:Boolean(s?.ghost), graveyard:gy, corpse, choices:[{ id:"corpse", label:"Return to corpse", enabled:corpse.ok }, { id:"spirit", label:"Resurrect at spirit healer", enabled:Boolean(s?.ghost) }] }; }
export function resurrectAtCorpseIfNear(olam) { const check = canResurrectAtCorpse(olam); return check.ok ? resurrectAtCorpse(olam) : { ok:false, reason:"too-far-from-corpse", ...check }; }
export function resurrectAtSpiritHealer(olam) { const p = playerOf(olam), s = ensureDeathState(olam), gy = graveyardById(s?.graveyard); if (!s?.ghost) return { ok:false, reason:"not-ghost" }; if (p.mesh?.position?.set) p.mesh.position.set(gy.x, gy.y, gy.z); s.dead = false; s.ghost = false; p.hp = Math.max(1, Math.floor(Number(p.maxHp || 100) * .35)); olam?.ayshPeula?.("ui event", "spiritHealer", { ok:true, graveyard:gy }); return { ok:true, graveyard:gy, deathState:s }; }
export default { spiritHealerPayload, canResurrectAtCorpse, resurrectAtCorpseIfNear, resurrectAtSpiritHealer };
