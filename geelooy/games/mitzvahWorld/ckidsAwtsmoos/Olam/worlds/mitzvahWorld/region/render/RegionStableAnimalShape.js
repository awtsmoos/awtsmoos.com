// B"H
/**
 * RegionStableAnimalShape.js
 *
 * Animal history showed the better-looking path was the procedural skinned
 * single-mesh compiler under region/wildlife/skinned. This file restores that
 * renderer as the primary wildlife body while retaining the readable multipart
 * fallback for any browser/runtime that cannot compile the skinned vessel.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { buildAnimal as buildSkinnedAnimal } from "../wildlife/render/AnimalBodyForge.js?v=realistic-target-proof-20260706-bh2";
import { addAnimalParts } from "./animalShape/AnimalParts.js?v=mitzvah-aggressive-split-20260703-bh1";
import { animalProfile, animalScale } from "./animalShape/AnimalProfile.js?v=mitzvah-aggressive-split-20260703-bh1";

const BOX = new THREE.Box3();

function countMeshes(root) {
  let count = 0;
  root?.traverse?.(child => {
    if (child?.isMesh || child?.isSkinnedMesh || child?.isInstancedMesh) count += 1;
  });
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
  const groundLift = measureGroundLift(root);
  const meshes = countMeshes(root);
  Object.assign(root.userData ||= {}, {
    stableNormalAnimal: true,
    species,
    displayName: root.userData.displayName || displayName(species),
    targetName: root.userData.targetName || displayName(species),
    wildlifeActor: true,
    selectableCombatTarget: true,
    interactable: true,
    skipRaycast: false,
    realisticAnimal: mode === "procedural-skinned",
    proceduralSkinnedAnimal: mode === "procedural-skinned",
    multiPartAnimalMesh: mode === "multipart-fallback",
    singleMergedAnimalMesh: false,
    renderMeshCount: meshes,
    visualRepairMode: mode,
    animalGenerationSource: mode === "procedural-skinned"
      ? "git-history-restored-AnimalBodyForge-20260628"
      : "multipart-visible-fallback",
    profile: { ...(root.userData.profile || {}), groundLift, species },
    health: safeHealth(root, species),
    faction: root.userData.faction || (species === "fox" ? "hostile" : "neutral"),
    ...extra
  });
  root.traverse?.(child => {
    Object.assign(child.userData ||= {}, {
      wildlifeActor: true,
      stableAnimalPart: child !== root,
      selectableCombatTarget: true,
      combatTargetRoot: root,
      skipOctree: true,
      noOctree: true,
      skipRaycast: /shadow/i.test(child.name || "") ? true : false
    });
    child.nivraAwtsmoos = root;
  });
  return root;
}

function buildFallbackAnimal(species = "rabbit", data = {}) {
  const root = new THREE.Group();
  const profile = animalProfile(species);
  root.name = `stable_visible_${species}_${data.id || "wild"}`;
  addAnimalParts(root, profile);
  root.scale.multiplyScalar(animalScale(species));
  return sealAnimal(root, species, "multipart-fallback", {
    fallbackReason: "skinned animal compiler unavailable",
    profile: { speed: profile.speed, species }
  });
}

export function buildStableAnimal(species = "rabbit", data = {}) {
  try {
    const root = buildSkinnedAnimal(species, data);
    root.name = `restored_realistic_${species}_${data.id || "wild"}`;
    return sealAnimal(root, species, "procedural-skinned", {
      singleMeshAnimal: true,
      realisticBodyUpgrade: true,
      historyRestoreCommitHint: "AnimalBodyForge existed before multipart fallback"
    });
  } catch (error) {
    const fallback = buildFallbackAnimal(species, data);
    fallback.userData.skinnedAnimalError = String(error?.message || error);
    return fallback;
  }
}

export default buildStableAnimal;
