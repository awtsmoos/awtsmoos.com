// B"H
/** @file DoorAnimationRuntime.js @description Smooth cottage door hinge animation by door state. */
function eachDoor(root, fn) { root?.traverse?.(child => { if (child.userData?.doorHingePivot) fn(child, child.userData.doorState); }); }
export function setDoorVisualState(root, doorId, state = {}) { eachDoor(root, (pivot, door) => { if (door?.id !== doorId) return; Object.assign(door, state); door.targetAngle = door.open ? (door.hinge === "left" ? -1.42 : 1.42) : 0; }); }
export function updateDoorAnimations(root, dt = 1/60) { const speed = Math.min(1, Math.max(.02, dt * 7)); eachDoor(root, (pivot, door) => { door.angle = Number(door.angle || 0) + (Number(door.targetAngle || 0) - Number(door.angle || 0)) * speed; pivot.rotation.y = door.angle; }); }
export default { setDoorVisualState, updateDoorAnimations };
