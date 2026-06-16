// B"H
/** @file RestedXpRuntime.js @description Rested XP reservoir, inn/logout accumulation, combat/Torah consumption, and UI payloads. */
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function now() { return Date.now(); }
export function ensureRestedXp(olam) { const p = playerOf(olam); if (!p) return null; p.restedXp ||= { value:0, max:600, boundInn:"village_inn", restedAt:0, lastLogoutAt:0, lastAccumulatedAt:0 }; return p.restedXp; }
export function restedPayload(olam) { const r = ensureRestedXp(olam); return { restedXp:r, percent:r ? Math.max(0, Math.min(1, Number(r.value || 0) / Math.max(1, Number(r.max || 1)))) : 0 }; }
export function emitRestedXp(olam) { const payload = restedPayload(olam); olam?.ayshPeula?.("ui event", "restedXp", payload); olam?.ayshPeula?.("ui event", "gameHUD", { restedXp:payload }); return payload; }
export function grantRestedXp(olam, amount = 60) { const r = ensureRestedXp(olam); if (!r) return false; r.value = Math.min(r.max, Number(r.value || 0) + Math.max(0, Number(amount) || 0)); r.restedAt = now(); r.lastAccumulatedAt = now(); emitRestedXp(olam); return r; }
export function bindRestedInn(olam, innId = "village_inn") { const r = ensureRestedXp(olam); if (!r) return false; r.boundInn = innId; r.restedAt = now(); emitRestedXp(olam); return r; }
export function markLogoutRestStart(olam) { const r = ensureRestedXp(olam); if (!r) return false; r.lastLogoutAt = now(); return r; }
export function accumulateLoggedOutRest(olam, currentTime = now()) { const r = ensureRestedXp(olam); if (!r?.lastLogoutAt) return r; const minutes = Math.max(0, Math.floor((currentTime - r.lastLogoutAt) / 60000)); if (minutes > 0) grantRestedXp(olam, Math.min(300, minutes * 2)); r.lastLogoutAt = 0; return r; }
export function consumeRestedBonus(olam, xp = 0) { const r = ensureRestedXp(olam); if (!r || r.value <= 0) return 0; const bonus = Math.min(r.value, Math.floor(Number(xp || 0) * .5)); r.value -= bonus; emitRestedXp(olam); return bonus; }
export default { ensureRestedXp, restedPayload, emitRestedXp, grantRestedXp, bindRestedInn, markLogoutRestStart, accumulateLoggedOutRest, consumeRestedBonus };
