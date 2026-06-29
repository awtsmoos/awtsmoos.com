// B"H
/**
 * @file DoorColliderState.js
 * @description
 * A door has one collision truth: closed is solid, moving/open is passable.
 * The mesh userData mirrors that truth for octree intake, ray selection, and
 * debug overlays.
 */

export function doorUserData(door) {
  if (!door?.mesh) return {};
  door.mesh.userData ||= {};
  return door.mesh.userData;
}

export function markDoorPassable(door) {
  Object.assign(doorUserData(door), {
    isOpen: true,
    isSolid: false,
    passableDoor: true,
    explicitCollision: false
  });
  if (door) door.isSolid = false;
}

export function markDoorSolid(door) {
  Object.assign(doorUserData(door), {
    isOpen: false,
    isSolid: true,
    passableDoor: false,
    explicitCollision: true
  });
  if (door) door.isSolid = true;
}

export function syncDoorColliderUserData(door) {
  if (!door) return {};
  if (door.isOpen || door._isMoving) markDoorPassable(door);
  else markDoorSolid(door);
  return doorUserData(door);
}

export default {
  doorUserData,
  markDoorPassable,
  markDoorSolid,
  syncDoorColliderUserData
};
