// B"H
/** @file CastBarRuntime.js @description Enemy cast bar payloads for interrupt windows and readable solo combat. */
export function castBarPayload(caster = null, cast = null) { if (!caster || !cast) return { active:false }; const now = Date.now(); const start = Number(cast.startedAt || now), end = start + Number(cast.durationMs || 1500); return { active:now < end, caster:caster.name || caster.id || "Enemy", spell:cast.name || "Cast", progress:Math.max(0, Math.min(1, (now - start) / Math.max(1, end - start))), interruptible:cast.interruptible !== false }; }
export function emitCastBar(olam, caster, cast) { const payload = castBarPayload(caster, cast); olam?.ayshPeula?.("ui event", "castBar", payload); return payload; }
export default { castBarPayload, emitCastBar };
