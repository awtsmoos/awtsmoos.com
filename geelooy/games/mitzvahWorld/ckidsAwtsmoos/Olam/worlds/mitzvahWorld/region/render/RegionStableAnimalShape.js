// B"H
/**
 * RegionStableAnimalShape.js
 *
 * No more bead-chain animals. The first vessel is now the Awtsmoos procedural
 * one-mesh animal: one Mesh, one BufferGeometry, readable species metadata,
 * and explicit proof flags for Movie Maker and gameplay audits.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { createAwtsmoosProceduralAnimalMesh } from "../wildlife/render/AwtsmoosProceduralAnimalMesh.js?v=one-mesh-awtsmoos-animal-20260707-bh1";

const BOX = new THREE.Box3();

function countMeshes(root) {
  let count = 0;
  root?.traverse?.(child => { if (child?.isMesh || child?.isSkinnedMesh || child?.isInstancedMesh) count += 1; });
  return count;
}

function displayName(species = "rabbit") {
  return `${species.charAt(0).toUpperCase()}${species.slice(1)}`;
}

function measureGroundLift(root) {
  root?.updateWorldMatrix?.(true, true);
  BOX.setFromObject(root);
  return Math.max(0.08, -BOX.min.y + 0.035);
}

function safeHealth(root, species) {
  const existing = root?.userData?.health;
  if (existing?.max) return existing;
  const max = species === "fox" ? 180 : species === "deer" ? 260 : species === "goat" ? 220 : species === "cow" ? 300 : 120;
  return { current:max, max, dead:false, hitsTaken:0 };
}

function sealAnimal(root, species, mode, extra = {}) {
  const groundLift = measureGroundLift(root), meshes = countMeshes(root);
  Object.assign(root.userData ||= {}, {
    stableNormalAnimal:true,
    species,
    displayName:root.userData.displayName || displayName(species),
    targetName:root.userData.targetName || displayName(species),
    wildlifeActor:true,
    selectableCombatTarget:true,
    interactable:true,
    skipRaycast:false,
    realisticAnimal:true,
    proceduralSkinnedAnimal:false,
    multiPartAnimalMesh:false,
    singleMergedAnimalMesh:true,
    singleMeshAnimal:true,
    renderMeshCount:meshes,
    visualRepairMode:mode,
    animalGenerationSource:"AwtsmoosProceduralAnimalMesh",
    profile:{ ...(root.userData.profile || {}), groundLift, species },
    health:safeHealth(root, species),
    faction:root.userData.faction || (species === "fox" ? "hostile" : "neutral"),
    ...extra
  });
  root.traverse?.(child => {
    Object.assign(child.userData ||= {}, {
      wildlifeActor:true,
      stableAnimalPart:child !== root,
      selectableCombatTarget:true,
      combatTargetRoot:root,
      skipOctree:true,
      noOctree:true,
      singleMeshAnimal:true,
      skipRaycast:/shadow/i.test(child.name || "") ? true : false
    });
    child.nivraAwtsmoos = root;
  });
  return root;
}

function emergencyOneMesh(species = "rabbit", data = {}) {
  const geometry = new THREE.BoxGeometry(.9, .55, 1.35, 5, 3, 6);
  const material = new THREE.MeshStandardMaterial({ color:0x9a714b, roughness:.9 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `emergency_one_mesh_${species}_${data.id || "wild"}`;
  return mesh;
}

export function buildStableAnimal(species = "rabbit", data = {}) {
  try {
    const root = createAwtsmoosProceduralAnimalMesh(species, data);
    root.name = `awtsmoos_realistic_one_mesh_${species}_${data.id || "wild"}`;
    return sealAnimal(root, species, "awtsmoos-one-mesh", { notSphereChain:true, movieReadyAnimal:true });
  } catch (error) {
    const fallback = emergencyOneMesh(species, data);
    fallback.userData.oneMeshAnimalError = String(error?.message || error);
    return sealAnimal(fallback, species, "emergency-one-mesh", { notSphereChain:true, emergencyFallback:true });
  }
}

export default buildStableAnimal;
