// B"H
/** @file DoorStateIndex.js @description Door id/default-state utilities for cottage runtime. */
export function doorIdFor(house = {}) { return house.door?.doorId || `${house.id || house.houseId || "house"}_front_door`; }
export function defaultDoorState(house = {}) { const id = doorIdFor(house); return { id, houseId:house.id || house.houseId, open:false, locked:Boolean(house.door?.locked), hinge:house.door?.hinge || "left", keyId:house.door?.keyId || `${id}_key`, lockId:house.door?.lockId || `${id}_lock`, angle:0, targetAngle:0 }; }
export function doorStatePayload(door = {}) { return { id:door.id, houseId:door.houseId, open:Boolean(door.open), locked:Boolean(door.locked), hinge:door.hinge, keyId:door.keyId, lockId:door.lockId, angle:Number(door.angle || 0), targetAngle:Number(door.targetAngle || 0) }; }
export default { doorIdFor, defaultDoorState, doorStatePayload };
