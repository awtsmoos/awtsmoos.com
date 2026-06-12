// B"H
/** @file cottageRecipe.js @description Chapter 937: cottages import RAM shader interiors/materials. */
import * as THREE from "/games/scripts/build/three.module.js";
import { buildBrickStructure, cube } from "./cottage/brickMason.js";
import { HOUSE_BRICK_STRUCTURE } from "./cottage/houseShellPlan.js?v=split-front-no-mortar-door-20260603-bh370";
import { buildInteriorDetails } from "./cottage/interiorDetails.js?v=ram-shader-interiors-20260612-bh1";
import { buildDoorTrim, buildWindowsRoofAndExterior } from "./cottage/roofAndExterior.js?v=true-gable-roof-20260603-bh390";
import { rvMesh, rvSeal } from "./RealisticVillageMaterials.js?v=webgl-progress-materials-20260612-bh1";
function sealVisualPhysicsContract(group) { Object.assign(group.userData ||= {}, { cottageVisualOnly: true, colliderOwner: "VillageHouseCollider", realisticInterior: true, ramShaderTexture: true, warning: "Decorative cottage meshes must never enter worldOctree." }); rvSeal(group); }
function sightOnly(mesh) { Object.assign(mesh.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, villageDecor: true }); return mesh; }
function buildThresholdSightOnly(group) { sightOnly(cube(group, 0x9f835d, [0, .014, 2.84], [.94, .018, .32], "floor")).name = "thin_visual_threshold_low_no_collider"; sightOnly(cube(group, 0xe5d3ac, [0, .042, 2.52], [.98, .018, .1], "stone")).name = "thin_floor_lip_low_not_blocker"; }
function addAssetAccents(group) { group.add(rvMesh("box", "plaster", [0, 1.08, -2.12], [6.5, 2.1, .08], [0, 0, 0], { repeat: 3 })); group.add(rvMesh("box", "roof", [0, 2.42, 0], [6.8, .08, 4.7], [0, 0, .52], { repeat: 4 })); group.add(rvMesh("box", "roof", [0, 2.42, 0], [6.8, .08, 4.7], [0, 0, -.52], { repeat: 4 })); group.add(rvMesh("box", "darkWood", [-3.34, 1.18, .08], [.12, 2.2, 4.35], [0, 0, 0], { repeat: 2 })); group.add(rvMesh("box", "darkWood", [3.34, 1.18, .08], [.12, 2.2, 4.35], [0, 0, 0], { repeat: 2 })); }
export function gableHouse() { const group = new THREE.Group(); group.name = "gableHouse_ram_shader_lived_in_cottage"; buildInteriorDetails(group); buildBrickStructure(group, HOUSE_BRICK_STRUCTURE); buildThresholdSightOnly(group); buildDoorTrim(group); buildWindowsRoofAndExterior(group); addAssetAccents(group); sealVisualPhysicsContract(group); return group; }
