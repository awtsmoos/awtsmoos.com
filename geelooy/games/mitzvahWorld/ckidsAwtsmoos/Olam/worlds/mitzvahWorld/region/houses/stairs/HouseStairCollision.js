// B"H
/** @file HouseStairCollision.js @description Adds stair/floor collision source metadata. */
export function addHouseStairCollision(colliders, house = {}, spec = {}, plan = {}) {
  if (!plan.enabled) return colliders;
  const id = house.id || "house";
  colliders.push(
    { id:`${id}_second_floor_proxy`, category:"cottage-floor", floor:true, secondFloor:true, size:[Number(spec.width || 9) * .86, .18, Number(spec.depth || 8) * .78], position:[0, plan.floorHeight, 0], solid:true },
    { id:`${id}_stair_walkable_proxy`, category:"cottage-stair", stair:true, floor:true, size:[plan.stair.width, plan.floorHeight, plan.stair.depth], position:[plan.stair.x, plan.floorHeight * .5, plan.stair.z + plan.stair.depth * .5], solid:true },
    { id:`${id}_interior_stair_door_proxy`, category:"closed-door", door:true, interiorDoor:true, size:[1.1, 2.1, .18], position:[plan.stair.x, 1.05, plan.stair.z - .35], solid:true }
  );
  return colliders;
}

export default addHouseStairCollision;
