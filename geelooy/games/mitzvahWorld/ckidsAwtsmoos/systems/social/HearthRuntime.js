// B"H
/** @file HearthRuntime.js @description Hearth bind and recall for solo travel. */
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
export function ensureHearth(olam) { const p = playerOf(olam); if (!p) return null; p.hearth ||= { boundId:"village_inn", x:0, y:0, z:0, cooldownUntil:0 }; return p.hearth; }
export function bindHearth(olam, id = "village_inn", pos = null) { const p = playerOf(olam), h = ensureHearth(olam); if (!p || !h) return false; const m = pos || p.mesh?.position || {}; Object.assign(h, { boundId:id, x:Number(m.x || 0), y:Number(m.y || 0), z:Number(m.z || 0) }); olam?.ayshPeula?.("ui event", "hearth", { bound:h }); return h; }
export function hearthRecall(olam) { const p = playerOf(olam), h = ensureHearth(olam); if (!p || !h) return false; if (Date.now() < Number(h.cooldownUntil || 0)) return { ok:false, reason:"cooldown", hearth:h }; if (p.mesh?.position?.set) p.mesh.position.set(h.x, h.y, h.z); h.cooldownUntil = Date.now() + 20 * 60 * 1000; olam?.ayshPeula?.("ui event", "hearth", { recalled:h }); return { ok:true, hearth:h }; }
export default { ensureHearth, bindHearth, hearthRecall };
