// B"H
/**
 * Cottage builder: the Awtsmoos breathes a real house into the scene.
 *
 * Not a painted cube, not a silent mirage: segmented walls, interior floor,
 * and a hinged door share one collider scroll. The doorway is carved from
 * real wall pieces, so the opening stays open when the door yields.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { COTTAGE_BRICK_PALETTE as P } from "./CottageBrickPalette.js";
import { addCottageWalls } from "./CottageBrickWalls.js";
import { addCottageBeams, addCottageWindows } from "./CottageBrickDetails.js";
import { buildCottageDoor } from "./CottageDoorSystem.js?v=solid-door-local-collider-20260702-bh2";
import { addCottageInterior } from "./CottageInteriorSystem.js?v=visible-floor-not-wall-20260702-bh1";

export function cottageSpec(house = {}) {
  return {
    width: house.sx || 6.2,
    depth: house.sz || 5.4,
    height: house.sy || 3.2,
    brick: P.wall.size,
    doorWidth: house.door?.width || 1.28,
    doorHeight: house.door?.height || 2.15
  };
}

function seal(group, house, colliders, door) {
  Object.assign(group.userData ||= {}, {
    cottageBrickSystem: true,
    houseId: house.id,
    colliderSources: colliders,
    colliderSchema: "compound-cottage-v4-live-door",
    collisionStrategy: "static-compound-door-gap-interior-live-door",
    doorState: door.state,
    liveDoorCollider: true,
    realInterior: true,
    realDoorway: true
  });
}

export function buildCottageBricks(house = {}) {
  const group = new THREE.Group();
  const spec = cottageSpec(house);
  const colliders = [];
  const door = buildCottageDoor(house, spec);
  group.name = `cottage_brick_system_${house.id}`;
  addCottageWalls(group, house, spec, colliders);
  addCottageInterior(group, house, spec, colliders);
  group.add(door.root);
  addCottageBeams(group, house, spec);
  group.userData.roofHandledByCottageRoofBuilder = true;
  addCottageWindows(group, house, spec);
  seal(group, house, colliders, door);
  return { group, colliders, spec, door };
}

export default buildCottageBricks;
