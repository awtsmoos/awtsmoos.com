// B"H
/**
 * @file cottageRecipe.js
 * @description
 * Chapter 220: The cottage became two kingdoms, sight and touch.
 *
 * Sight receives real procedural brick courses: data spans, carved doorway,
 * stout wooden trim, roof, glow, and furniture. Touch stays elsewhere in simple
 * invisible colliders. Future AI: do not join these kingdoms. Visual masonry is
 * decorative/no-octree after VillagePictureProp marks it; VillageHouseCollider
 * alone supplies floor, walls, jambs, lintel, and furniture physics.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { buildBrickStructure, cube } from "./cottage/brickMason.js";
import { HOUSE_BRICK_STRUCTURE } from "./cottage/houseShellPlan.js";
import { buildInteriorDetails } from "./cottage/interiorDetails.js";
import { buildDoorTrim, buildWindowsRoofAndExterior } from "./cottage/roofAndExterior.js";

function sealVisualPhysicsContract(group) {
  group.userData ||= {};
  group.userData.cottageVisualOnly = true;
  group.userData.colliderOwner = "VillageHouseCollider";
  group.userData.warning = "Do not add decorative cottage meshes to worldOctree.";
}

function buildThresholdSightOnly(group) {
  cube(group, 0x9f835d, [0, 0.026, 2.84], [1.08, 0.05, 0.5], "floor").name = "visual_flat_threshold_no_collider";
  cube(group, 0xe5d3ac, [0, 0.095, 2.5], [1.22, 0.07, 0.18], "stone").name = "visual_lower_door_stone_no_collider";
}

function buildReadableDoorwayDarkness(group) {
  cube(group, 0x46351f, [0, 0.48, 2.505], [0.52, 0.78, 0.026], "wood").name = "doorway_shadow_not_solid";
  cube(group, 0xb89b64, [0, 0.042, 1.92], [0.58, 0.035, 1.1], "floor").name = "visible_entry_floor_flush";
}

/**
 * Builds the large decorative village cottage.
 * @returns {THREE.Group} decorative house only.
 */
export function gableHouse() {
  const group = new THREE.Group();
  group.name = "gableHouse_visual_brick_cottage";
  buildInteriorDetails(group);
  buildBrickStructure(group, HOUSE_BRICK_STRUCTURE);
  buildThresholdSightOnly(group);
  buildReadableDoorwayDarkness(group);
  buildDoorTrim(group);
  buildWindowsRoofAndExterior(group);
  sealVisualPhysicsContract(group);
  return group;
}
