// B"H
/** @file DoorTransitionRuntime.js @description Door activation and transition intent without optional parser paths. */
function dataOf(door) { return door && door.userData ? door.userData : {}; }
function playerId(player) { return player && player.id ? player.id : null; }
export function activateDoor(door, player, olam) { const data = dataOf(door); if (data.locked) return { ok:false, reason:"locked" }; const payload = { destination:data.destination || null, player:playerId(player), door:door ? door.name || null : null }; if (olam && typeof olam.ayshPeula === "function") olam.ayshPeula("door transition", payload); return { ok:true, payload }; }
export default activateDoor;
