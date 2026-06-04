// B"H
/**
 * @file cottageRecipe.js
 * @description
 * Chapter 390: The cottage receives true gable roof generation.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { buildBrickStructure, cube } from "./cottage/brickMason.js";
import { HOUSE_BRICK_STRUCTURE } from "./cottage/houseShellPlan.js?v=split-front-no-mortar-door-20260603-bh370";
import { buildInteriorDetails } from "./cottage/interiorDetails.js";
import { buildDoorTrim, buildWindowsRoofAndExterior } from "./cottage/roofAndExterior.js?v=true-gable-roof-20260603-bh390";

function sealVisualPhysicsContract(group) { Object.assign(group.userData ||= {}, { cottageVisualOnly: true, colliderOwner: "VillageHouseCollider", warning: "Decorative cottage meshes must never enter worldOctree." }); }
function sightOnly(mesh) { Object.assign(mesh.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, villageDecor: true }); return mesh; }
function buildThresholdSightOnly(group) {
  sightOnly(cube(group, 0x9f835d, [0, 0.014, 2.84], [0.94, 0.018, 0.32], "floor")).name = "thin_visual_threshold_low_no_collider";
  sightOnly(cube(group, 0xe5d3ac, [0, 0.042, 2.52], [0.98, 0.018, 0.1], "stone")).name = "thin_floor_lip_low_not_blocker";
}
export function gableHouse() {
  const group = new THREE.Group();
  group.name = "gableHouse_visual_empty_doorway_true_gable_roof";
  buildInteriorDetails(group);
  buildBrickStructure(group, HOUSE_BRICK_STRUCTURE);
  buildThresholdSightOnly(group);
  buildDoorTrim(group);
  buildWindowsRoofAndExterior(group);
  sealVisualPhysicsContract(group);
  return group;
}
