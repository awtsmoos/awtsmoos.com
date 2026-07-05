// B"H
/**
 * RegionStableAnimalShape.js
 * Multi-part stable wildlife. The previous single merged mesh made animals read
 * as pixelated lumps; this restored body keeps silhouettes, accents, eyes, legs,
 * horns, wings, and shadows as inspectable child vessels.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { addAnimalParts } from "./animalShape/AnimalParts.js?v=mitzvah-aggressive-split-20260703-bh1";
import { animalProfile, animalScale } from "./animalShape/AnimalProfile.js?v=mitzvah-aggressive-split-20260703-bh1";

const BOX = new THREE.Box3();

function countMeshes(root) {
  let count = 0;
  root.traverse?.(child => { if (child?.isMesh || child?.isSkinnedMesh || child?.isInstancedMesh) count += 1; });
  return count;
}

export function buildStableAnimal(species = "rabbit", data = {}) {
  const root = new THREE.Group();
  const profile = animalProfile(species);
  root.name = `stable_visible_${species}_${data.id || "wild"}`;
  addAnimalParts(root, profile);
  root.scale.multiplyScalar(animalScale(species));
  root.updateWorldMatrix(true, true);
  BOX.setFromObject(root);
  const groundLift = Math.max(0.08, -BOX.min.y + 0.035);
  Object.assign(root.userData ||= {}, {
    stableNormalAnimal: true,
    species,
    displayName: species,
    targetName: species,
    multiPartAnimalMesh: true,
    singleMergedAnimalMesh: false,
    renderMeshCount: countMeshes(root),
    visualRepairMode: "multi-part-stable-animal-bh1",
    profile: { speed: profile.speed, groundLift, species },
    health: { current: 120, max: 120, dead: false, hitsTaken: 0 },
    faction: profile.faction
  });
  return root;
}

export default buildStableAnimal;
