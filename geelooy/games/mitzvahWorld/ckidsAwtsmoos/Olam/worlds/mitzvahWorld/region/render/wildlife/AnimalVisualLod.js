// B"H
/**
 * B"H
 *
 * Animal visual LOD keeps gameplay roots steady while the visible creature
 * changes clothing for distance: full single-mesh anatomy near, simplified
 * anatomy at mid range, and an intentional silhouette at the horizon.
 */
import { createAnimalFarImpostor, createAnimalMidSimple } from "./AnimalImpostorFactory.js?v=animal-realism-split-20260705-bh1";
import { ANIMAL_MID_IN, ANIMAL_MID_OUT, ANIMAL_NEAR_IN, ANIMAL_NEAR_OUT, BIRD_MID_IN } from "./lod/AnimalLodBands.js?v=animal-realism-split-20260705-bh1";
function playerPosition(olam) {
  return (olam?.player || olam?.chossid)?.mesh?.position || null;
}

function distSq(a, b) {
  if (!a || !b) return Infinity;
  const dx = Number(a.x || 0) - Number(b.x || 0);
  const dz = Number(a.z || 0) - Number(b.z || 0);
  return dx * dx + dz * dz;
}

function visualTier(root, olam) {
  const species = root?.userData?.motion?.species || root?.userData?.species || "";
  if (root?.userData?.dead || root?.userData?.lootable) return "corpse";
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

function setFullVisible(state, visible) {
  state.fullChildren.forEach(child => {
    if (child === state.mid || child === state.far) return;
    child.visible = visible;
  });
}

export function applyAnimalVisualLod(root, olam) {
  if (!root?.userData) return "unknown";
  const state = ensureState(root);
  const tier = visualTier(root, olam);
  if (tier !== state.tier) {
    state.tier = tier;
    state.switches++;
  }
  const near = tier === "near" || tier === "corpse";
  setFullVisible(state, near);
  state.mid.visible = tier === "mid";
  state.far.visible = tier === "far";
  root.visible = true;
  Object.assign(root.userData, {
    visualLodTier:tier,
    visualCulled:false,
    interactionProxyAlive:true,
    realisticAnimal:true,
    animalLodSwitches:state.switches,
    noAnimalMeshRebuildEveryFrame:true
  });
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
