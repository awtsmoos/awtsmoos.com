// B"H
/**
 * @file RegionWildlifeActors.js
 * @description
 * A wildlife actor remains selectable and lootable, but its passive herd body
 * may wear cheaper clothing. The Awtsmoos removes mobile shadow waste from
 * animals so crisp DPR is paid for visible edges, not hidden shadow casters.
 */
import { ensureWildlifeCombat } from "../../../../../systems/creatures/WildlifeCombatAdapter.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { makeLootableCorpse, lootPayload } from "../../../../../systems/loot/LootRuntime.js?compact=true&v=final-lootable-corpse-20260705-bh1";
import { groundY } from "./RegionGround.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { sealRegionVisual } from "./RegionSeal.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { FLAGS, clearSpawn, countMeshes, radius, safe, speed } from "./RegionWildlifeData.js?compact=true&v=lod-house-octree-20260705-bh1";
import { buildStableAnimal } from "./RegionStableAnimalShape.js?compact=true&v=full-revamp-realistic-animals-20260704-bh1";
import { applyAnimalVisualLod } from "./wildlife/AnimalVisualLod.js?compact=true&v=mobile-crisp-passive-herd-lod-20260705-bh2";
import { ensureAnimalInteractionProxy } from "./wildlife/AnimalInteractionProxy.js?compact=true&v=lod-house-octree-20260705-bh1";

function initialDestination(point, index, species, radiusValue) {
  const angle = (index * 2.399963 + species.length * 0.41) % (Math.PI * 2);
  const range = Math.min(radiusValue * 0.45, 4 + (index % 5) * 1.7);
  return { x:point.x + Math.cos(angle) * range, z:point.z + Math.sin(angle) * range };
}

function registerInteractable(olam, root) {
  if (!olam || !root) return;
  olam.interactableNivrayim ||= [];
  if (!olam.interactableNivrayim.includes(root)) olam.interactableNivrayim.push(root);
}

function openLoot(root) {
  const olam = root.__awtsmoosOlam;
  const id = root.userData?.lootableCorpseId || root.lootableCorpseId;
  if (!id) return false;
  globalThis.__MITZVAH_OPEN_LOOT__?.(id);
  olam?.ayshPeula?.("ui event", "loot", lootPayload(olam, id));
  return true;
}

function actorAction(root, peula) {
  const action = String(peula?.action || peula || "");
  if (/mouseEnter|hover/i.test(action)) return root.userData.hovered = true, true;
  if (/mouseLeave/i.test(action)) return root.userData.hovered = false, true;
  if (root.userData?.dead || root.userData?.lootable) return /accepted interaction|click|pointerdown|interact/.test(action) ? openLoot(root) : false;
  root.__awtsmoosOlam?.combatManager?.selectTarget?.(root);
  return true;
}

function installActorActions(root) {
  root.ayshPeula = peula => actorAction(root, peula);
  root.interact = () => actorAction(root, { action:"accepted interaction" });
  root.userData.onInteract = () => actorAction(root, { action:"accepted interaction" });
}

function takeDamageFactory(root) {
  return (amount = 0) => {
    const health = root.userData.health;
    if (health.dead) return 0;
    health.hitsTaken += 1;
    health.current = Math.max(0, Number(health.current || 0) - Math.max(1, Number(amount) || 1));
    health.dead = health.current <= 0;
    root.userData.healthPct = health.current / Math.max(1, health.max || 1);
    root.traverse?.(child => child.material?.emissive?.setHex?.(0x664400));
    setTimeout(() => root.traverse?.(child => child.material?.emissive?.setHex?.(0x000000)), 90);
    if (health.dead) markCorpse(root);
    return amount;
  };
}

function markCorpse(root) {
  root.userData.dead = true;
  root.userData.lootable = true;
  root.userData.selectableCombatTarget = false;
  root.userData.interactable = true;
  root.userData.interactionLabel = "Loot carcass";
  root.rotation.z = Math.PI / 2;
  root.position.y += 0.08;
  root.scale.multiplyScalar(0.92);
  root.traverse?.(child => {
    Object.assign(child.userData ||= {}, { selectableCombatTarget:false, deadWildlifeCorpse:true, interactable:true, skipRaycast:false });
    if (child.material) { child.material.transparent = false; child.material.opacity = 1; }
  });
  if (!root.__lootCorpseCreated) {
    const corpse = makeLootableCorpse(root.__awtsmoosOlam, root, { reason:"wildlife-corpse", position:root.position.clone?.() || root.position });
    root.__lootCorpseCreated = true;
    root.userData.lootableCorpseId = corpse?.corpseId || root.userData.lootableCorpseId;
    root.lootableCorpseId = root.userData.lootableCorpseId;
  }
  installActorActions(root);
  registerInteractable(root.__awtsmoosOlam, root);
}

function installCorpseAwareDamage(root) {
  if (root.__corpseAwareDamageInstalled) return;
  const previous = typeof root.takeDamage === "function" ? root.takeDamage.bind(root) : takeDamageFactory(root);
  root.takeDamage = (amount = 0, context = {}) => {
    const result = previous(amount, context);
    const health = root.userData?.health || {};
    if (!root.userData?.lootable && (health.dead || Number(health.current || 0) <= 0 || root.userData?.dead)) markCorpse(root);
    return result;
  };
  root.__corpseAwareDamageInstalled = true;
}

function restoreChildOwners(root) {
  root.traverse?.(child => {
    child.nivraAwtsmoos = root;
    child.castShadow = false;
    child.receiveShadow = false;
    Object.assign(child.userData ||= {}, {
      wildlifeActor:true,
      selectableCombatTarget:!root.userData?.dead,
      combatTargetRoot:root,
      skipOctree:true,
      noOctree:true,
      skipRaycast:child.userData?.animalLodVisual ? true : false
    });
  });
}

export function restoreFlags(root) {
  const meshes = countMeshes(root);
  Object.assign(root.userData, FLAGS, {
    stableNormalAnimal:true,
    renderMeshCount:meshes,
    singleMeshVerified:false,
    visualRepairMode:true,
    interactionLayer:"explicit-interaction"
  });
  root.nivraAwtsmoos = root;
  root.castShadow = false;
  root.receiveShadow = false;
  root.takeDamage ||= takeDamageFactory(root);
  installCorpseAwareDamage(root);
  installActorActions(root);
  restoreChildOwners(root);
}

export function makeActor(animal, index, olam, backend) {
  const species = animal.species || "rabbit";
  const root = buildStableAnimal(species, animal, backend);
  const point = clearSpawn(olam, safe(animal.x), safe(animal.z), index);
  const lift = root.userData?.profile?.groundLift || 0.18;
  const homeRadius = radius(animal);
  const firstGoal = initialDestination(point, index, species, homeRadius);
  root.position.set(point.x, groundY(olam, point.x, point.z) + lift, point.z);
  root.userData.species = species;
  root.userData.motion = { id:animal.id, species, homeX:point.x, homeZ:point.z, phase:index * 0.17, seed:index * 17 + species.length, radius:homeRadius, speed:speed(animal, root), vx:0, vz:0, destX:firstGoal.x, destZ:firstGoal.z, waypoint:0, wait:index % 6 === 0 ? 0.12 : 0, attackCooldown:0, animTime:0, wingBeat:species === "bird" ? 6 : 0, altitude:species === "bird" ? 2.4 : 0, groundLift:lift, initialMotionSeed:true };
  root.userData.species = species; root.userData.fullGameplayAnimal = true;
  root.userData.detailedNearAnimal = false;
  root.__awtsmoosOlam = olam;
  restoreFlags(root);
  ensureAnimalInteractionProxy(root);
  ensureWildlifeCombat(root, olam);
  sealRegionVisual(root, { ...FLAGS, skipRaycast:false, skipOctree:true, noOctree:true });
  restoreFlags(root);
  applyAnimalVisualLod(root, olam);
  return root;
}
