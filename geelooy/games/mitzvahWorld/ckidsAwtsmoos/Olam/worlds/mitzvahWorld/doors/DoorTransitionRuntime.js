// B"H
/** @file DoorTransitionRuntime.js @description Door activation, open state, and transition intent. */
function dataOf(door) { return door && door.userData ? door.userData : {}; }
function playerId(player) { return player && player.id ? player.id : null; }

export class DoorTransitionRuntime {
  constructor(olam = null) { this.olam = olam; }
  openDoor(door, player = null, olam = this.olam) {
    const data = dataOf(door);
    if (data.locked) return { ok:false, reason:"locked" };
    data.isOpen = true; data.open = true; data.isSolid = false;
    const payload = { destination:data.destination || null, player:playerId(player), door:door ? door.name || null : null };
    olam?.ayshPeula?.("door transition", payload);
    return { ok:true, payload };
  }
  closeDoor(door) {
    const data = dataOf(door);
    data.isOpen = false; data.open = false; data.isSolid = true;
    return { ok:true, door:door ? door.name || null : null };
  }
  toggleDoor(door, player = null, olam = this.olam) {
    return dataOf(door).isOpen || dataOf(door).open ? this.closeDoor(door) : this.openDoor(door, player, olam);
  }
}

export function activateDoor(door, player, olam) {
  return new DoorTransitionRuntime(olam).openDoor(door, player, olam);
}

export default activateDoor;
