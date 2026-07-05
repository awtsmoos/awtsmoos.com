// B"H
/**
 * B"H
 *
 * Animal impostors are not trash shapes for far distance.
 * They are small respectful poems: a fox keeps its tail, a rabbit keeps its
 * ears, a bird keeps its wings, and a frog stays low to the ground.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { addLodHeadDetails, addLodLegs, addLodMarkings, addLodTailAndWings, box, cone, sphere } from "./anatomy/AnimalLodShapeParts.js?v=animal-realism-split-20260705-bh1";
import { silhouetteFor } from "./AnimalSpeciesSilhouettes.js?v=animal-realism-split-20260705-bh1";

function assemble(root, s, tier) {
  addLodLegs(root, s, tier);
  addLodHeadDetails(root, s, tier);
  addLodTailAndWings(root, s, tier);
  addLodMarkings(root, s, tier);
  root.userData.animalVisualTier = tier;
  root.userData.anatomyScore = s.anatomyScore || 9;
  return root;
}

export function createAnimalMidSimple(species = "rabbit") {
  const s = silhouetteFor(species), root = new THREE.Group();
  root.name = `${species}_mid_simple_wildlife_lod`;
  root.add(sphere("mid_body", s.color, s.body, [0, s.low ? .18 : .36, 0]));
  if (s.chest) root.add(sphere("mid_chest", s.color, s.chest, [0, s.low ? .22 : .42, .2]));
  if (s.neck) root.add(sphere("mid_neck", s.color, s.neck, [0, .58, .24]));
  root.add(sphere("mid_head", s.color, s.head || [.18,.16,.16], [0, s.low ? .24 : .52, .36]));
  return assemble(root, s, "mid");
}

export function createAnimalFarImpostor(species = "rabbit") {
  const s = silhouetteFor(species), root = new THREE.Group();
  root.name = `${species}_far_impostor_wildlife_lod`;
  root.add(sphere("far_body_blob", s.color, s.body, [0, s.low ? .16 : .3, 0]));
  root.add(sphere("far_head_blob", s.color, s.head || [.14,.12,.12], [0, s.low ? .22 : .42, .28]));
  if (s.tail) root.add(box(`far_${species}_tail_signature`, s.tail.kind === "flag" ? (s.accent || s.color) : s.color, s.tail.scale, [0, (s.low ? .17 : .34) + (s.tail.lift || 0), -.44]));
  if (s.ears) root.add(box(`far_${species}_ear_signature`, s.color, s.ears.scale || [.08,.2,.035], [0, .64, .3]));
  if (s.horns) root.add(box(`far_${species}_horn_signature`, 0xeee0b7, [.24,.16,.035], [0, .67, .32]));
  if (s.wings) root.add(box(`far_${species}_wing_signature`, s.color, [.55,.035,.16], [0, .38, 0]));
  if (s.eyes) root.add(sphere(`far_${species}_raised_eye_signature`, s.dark || 0x050505, [.08,.035,.06], [0, .28, .4]));
  if (s.marks?.includes("beak")) root.add(cone("far_bird_beak_signature", 0xe1a32f, .035, .12, [0, .43, .43], [Math.PI / 2, 0, 0]));
  root.userData.animalVisualTier = "far";
  root.userData.anatomyScore = s.anatomyScore || 9;
  return root;
}

export default { createAnimalMidSimple, createAnimalFarImpostor };
