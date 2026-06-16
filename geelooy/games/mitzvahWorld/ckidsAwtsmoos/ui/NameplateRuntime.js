// B"H
/** @file NameplateRuntime.js @description Compact nameplate payloads for enemies and NPCs without noisy DOM inspection. */
export function nameplatePayload(targets = []) { return targets.filter(Boolean).map(t => ({ id:t.id || t.name, name:t.name || t.mesh?.name || "Target", hp:Number(t.hp || t.health?.current || 0), maxHp:Number(t.maxHp || t.health?.max || 1), elite:Boolean(t.elite || t.mesh?.userData?.elite), rare:Boolean(t.rare || t.mesh?.userData?.rare) })); }
export function emitNameplates(olam, targets = []) { const payload = { plates:nameplatePayload(targets) }; olam?.ayshPeula?.("ui event", "nameplates", payload); return payload; }
export default { nameplatePayload, emitNameplates };
