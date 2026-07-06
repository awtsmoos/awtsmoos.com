// B"H
/**
 * @file AnimalVisualLod.js
 * @description
 * Full anatomy remains for selected, fighting, corpse, or truly-near animals.
 * Passive herds step into simple crisp silhouettes sooner so mobile keeps the
 * high DPR vessel without letting skinned wildlife eat the frame.
 */
import { createAnimalFarImpostor, createAnimalMidSimple } from "./AnimalImpostorFactory.js?v=animal-realism-split-20260705-bh1";
import { ANIMAL_MID_IN, ANIMAL_MID_OUT, ANIMAL_NEAR_IN, ANIMAL_NEAR_OUT, BIRD_MID_IN } from "./lod/AnimalLodBands.js?v=animal-realism-split-20260705-bh2";

function playerPosition(olam) {
  return (olam?.player || olam?.chossid)?.mesh?.position || null;
}

function distSq(a, b) {
  if (!a || !b) return Infinity;
  const dx = Number(a.x || 0) - Number(b.x || 0);
  const dz = Number(a.z || 0) - Number(b.z || 0);
  return dx * dx + dz * dz;
}

function selectedTarget(olam) {
  return olam?.combatManager?.targeting?.selected || olam?.combatManager?.selectedTarget || olam?.__selectedCombatTarget || null;
}

function isProtectedFull(root, olam) {
  const target = selectedTarget(olam);
  const owner = root?.userData?.combatTargetOwner || root?.nivraAwtsmoos;
  const state = String(root?.userData?.animalState || owner?.stateName || "");
  return Boolean(
    root?.userData?.dead || root?.userData?.lootable ||
    target === root || target?.mesh === root || target === owner ||
    /chase|windup|strike|recover|attack/i.test(state)
  );
}

function visualTier(root, olam) {
  const species = root?.userData?.motion?.species || root?.userData?.species || "";
  if (isProtectedFull(root, olam)) return "near";
  const d2 = distSq(root.position, playerPosition(olam));
  const current = root.userData?.visualLodTier || "near";
  if (current === "near") return d2 > ANIMAL_NEAR_OUT * ANIMAL_NEAR_OUT ? "mid" : "near";
  if (current === "mid") {
    if (d2 < ANIMAL_NEAR_IN * ANIMAL_NEAR_IN) return "near";
    if (d2 > ANIMAL_MID_OUT * ANIMAL_MID_OUT) return "far";
    return "mid";
  }
  if (d2 < ANIMAL_NEAR_IN * ANIMAL_NEAR_IN) return "near";
  if (d2 < (species === "bird" ? BIRD_MID_IN * BIRD_MID_IN : ANIMAL_MID_IN * ANIMAL_MID_IN)) return "mid";
  return "far";
}

function ensureState(root) {
  if (root.__animalVisualLod) return root.__animalVisualLod;
  const species = root?.userData?.motion?.species || root?.userData?.species || "rabbit";
  const state = {
    tier:"near",
    fullSelf:Boolean(root?.isMesh || root?.isSkinnedMesh),
    fullMaterials:Array.isArray(root?.material) ? root.material.filter(Boolean) : (root?.material ? [root.material] : []),
    fullChildren:root.children.filter(child => child.name !== "AWTSMOOS_ANIMAL_INTERACTION_PROXY"),
    mid:createAnimalMidSimple(species),
    far:createAnimalFarImpostor(species),
    switches:0
  };
  state.mid.visible = false;
  state.far.visible = false;
  root.add(state.mid, state.far);
  root.__animalVisualLod = state;
  return state;
}

function setFullVisible(root, state, visible) {
  if (state.fullSelf) {
    for (const material of state.fullMaterials) material.visible = visible;
    root.userData.selfMeshMaterialHiddenForLod = !visible;
  }
  state.fullChildren.forEach(child => {
    if (child === state.mid || child === state.far) return;
    child.visible = visible;
  });
}

function publishBudget(root, tier, protectedFull) {
  root.userData.visualLodTier = tier;
  root.userData.visualCulled = false;
  root.userData.interactionProxyAlive = true;
  root.userData.realisticAnimal = true;
  root.userData.noAnimalMeshRebuildEveryFrame = true;
  root.userData.fullNearLodReason = protectedFull ? "selected-or-combat" : tier === "near" ? "true-near" : null;
}

export function applyAnimalVisualLod(root, olam) {
  if (!root?.userData) return "unknown";
  const state = ensureState(root);
  const protectedFull = isProtectedFull(root, olam);
  const tier = visualTier(root, olam);
  if (tier !== state.tier) {
    state.tier = tier;
    state.switches++;
  }
  const near = tier === "near";
  setFullVisible(root, state, near);
  state.mid.visible = tier === "mid";
  state.far.visible = tier === "far";
  root.visible = true;
  root.userData.animalLodSwitches = state.switches;
  root.userData.mobileCrispPassiveHerdLod = !near;
  root.userData.selfMeshHiddenForPassiveLod = Boolean(state.fullSelf && !near);
  publishBudget(root, tier, protectedFull);
  return tier;
}

export function summarizeAnimalVisualLod(root) {
  const counts = {};
  for (const child of root?.children || []) {
    const tier = child.userData?.visualLodTier || "unmeasured";
    counts[tier] = (counts[tier] || 0) + 1;
  }
  return counts;
}

export default applyAnimalVisualLod;
