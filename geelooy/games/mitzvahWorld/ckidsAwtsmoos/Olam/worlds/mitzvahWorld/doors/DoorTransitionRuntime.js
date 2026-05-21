/**
 * B"H
 * Chapter 21: The Threshold Split Two Worlds.
 */

export class DoorTransitionRuntime {
  constructor() {
    this.activeDoor = null;
  }

  openDoor(door, player) {
    if (door?.userData?.locked) {
      return { ok: false, reason: 'locked' };
    }

    door.userData.isOpen = true;
    this.activeDoor = door.name;

    return {
      ok: true,
      destination: door.userData?.destination || null,
      player: player?.id || null
    };
  }

  closeDoor(door) {
    door.userData.isOpen = false;
    return { ok: true };
  }
}

export default DoorTransitionRuntime;
