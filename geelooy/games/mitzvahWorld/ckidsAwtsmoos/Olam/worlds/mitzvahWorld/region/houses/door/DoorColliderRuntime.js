// B"H
/** @file DoorColliderRuntime.js @description Door collider source records follow open/closed state. */
export function isDoorSolid(doorState = {}) { return !doorState.open; }
export function doorColliderSources(cottageRoot) { const out = []; cottageRoot?.traverse?.(child => { const door = child.userData?.doorState; if (!door || !isDoorSolid(door)) return; out.push({ id:door.id, category:"closed-door", owner:door.houseId, position:child.userData.colliderPosition || [0,1,0], size:child.userData.colliderSize || [1.25,2.1,.24], yaw:child.getWorldRotation ? child.rotation.y : 0, door:true, open:false, locked:Boolean(door.locked), hinge:door.hinge, visibleTwin:door.id }); }); return out; }
export default { isDoorSolid, doorColliderSources };
