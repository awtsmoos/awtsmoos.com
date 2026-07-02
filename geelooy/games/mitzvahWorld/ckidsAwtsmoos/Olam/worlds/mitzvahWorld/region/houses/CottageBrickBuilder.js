// B"H
/** Cottage builder: real walls, real inside, real door, cache-fresh colliders. */
import * as THREE from "/games/scripts/build/three.module.js";
import { COTTAGE_BRICK_PALETTE as P } from "./CottageBrickPalette.js";
import { addCottageWalls } from "./CottageBrickWalls.js?v=actual-solid-house-20260702-bh5";
import { addCottageBeams, addCottageWindows } from "./CottageBrickDetails.js?v=actual-solid-house-20260702-bh5";
import { buildCottageDoor } from "./CottageDoorSystem.js?v=actual-solid-house-20260702-bh5";
import { addCottageInterior } from "./CottageInteriorSystem.js?v=actual-solid-house-20260702-bh5";

export function cottageSpec(house = {}) { return { width:house.sx || 6.2, depth:house.sz || 5.4, height:house.sy || 3.2, brick:P.wall.size, doorWidth:house.door?.width || 1.28, doorHeight:house.door?.height || 2.15 }; }
function seal(group, house, colliders, door) { Object.assign(group.userData ||= {}, { cottageBrickSystem:true, houseId:house.id, colliderSources:colliders, colliderSchema:"compound-cottage-v5-actual-solid", collisionStrategy:"static-compound-thick-walls-live-door", doorState:door.state, liveDoorCollider:true, realInterior:true, realDoorway:true, actualSolidHouseCacheBust:"20260702-bh5" }); }
export function buildCottageBricks(house = {}) {
  const group = new THREE.Group(), spec = cottageSpec(house), colliders = [], door = buildCottageDoor(house, spec);
  group.name = `cottage_brick_system_${house.id}_actual_solid_bh5`;
  addCottageWalls(group, house, spec, colliders); addCottageInterior(group, house, spec, colliders); group.add(door.root);
  addCottageBeams(group, house, spec); group.userData.roofHandledByCottageRoofBuilder = true; addCottageWindows(group, house, spec);
  seal(group, house, colliders, door); return { group, colliders, spec, door };
}
export default buildCottageBricks;
