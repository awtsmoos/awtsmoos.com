// B"H
/** @file MultiRoomHousePlan.js @description Derives readable multi-room cottage plans. */
export function multiRoomHousePlan(house = {}, spec = {}) {
  const w = Number(spec.width || house.sx || 9);
  const d = Number(spec.depth || house.sz || 8);
  const large = w * d > 72;
  const rooms = large
    ? ["front room", "study", "sleeping room", "storage nook"]
    : ["front room", "sleeping room", "study"];
  return {
    houseId:house.id || "house",
    roomCount:rooms.length,
    rooms,
    wallHeight:Number(spec.height || 4),
    floorPanels:1,
    interiorDoorways:Math.max(1, rooms.length - 1),
    layout:large ? "four-room-cross" : "three-room-split"
  };
}

export default multiRoomHousePlan;
