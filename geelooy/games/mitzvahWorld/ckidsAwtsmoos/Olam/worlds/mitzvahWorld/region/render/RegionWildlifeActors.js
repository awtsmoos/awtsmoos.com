// B"H
/**
 * @file RegionWildlifeActors.js
 * @description
 * Emergency repair: all wildlife now uses stable outward-normal animal shapes.
 * The Awtsmoos rejects inside-out ribs and broken skinned meshes until that
 * pipeline is proven in-browser again.
 */
import { ensureWildlifeCombat } from "../../../../../systems/creatures/WildlifeCombatAdapter.js";
import { groundY } from "./RegionGround.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { FLAGS, clearSpawn, countMeshes, radius, safe, speed } from "./RegionWildlifeData.js?v=perf-tight-collision-20260703-bh3";
import { buildStableAnimal } from "./RegionStableAnimalShape.js?v=stable-animals-20260628-bh1";

function takeDamageFactory(root) {
  return (amount = 0) => {
    const health = root.userData.health;
    health.hitsTaken += 1;
    health.current = Math.max(0, Number(health.current || 0) - Math.max(1, Number(amount) || 1));
    health.dead = health.current <= 0;
    root.userData.healthPct = health.current / Math.max(1, health.max || 1);
    root.traverse?.(child => {
      if (child.material?.emissive) child.material.emissive.setHex(0x664400);
    });
    setTimeout(() => root.traverse?.(child => child.material?.emissive?.setHex?.(0x000000)), 90);
    if (health.dead) root.visible = false;
    return amount;
  };
}

function restoreChildOwners(root) {
  root.traverse?.(child => {
    child.nivraAwtsmoos = root;
    Object.assign(child.userData ||= {}, {
      wildlifeActor: true,
      selectableCombatTarget: true,
      combatTargetRoot: root,
      skipOctree: true,
      noOctree: true,
      skipRaycast: false
    });
  });
}

export function restoreFlags(root) {
  const meshes = countMeshes(root);
  Object.assign(root.userData, FLAGS, {
    stableNormalAnimal: true,
    renderMeshCount: meshes,
    singleMeshVerified: false,
    visualRepairMode: true
  });
  root.nivraAwtsmoos = root;
  root.takeDamage ||= takeDamageFactory(root);
  restoreChildOwners(root);
}

export function makeActor(animal, index, olam, backend) {
  const species = animal.species || "rabbit";
  const root = buildStableAnimal(species, animal, backend);
  const point = clearSpawn(olam, safe(animal.x), safe(animal.z), index);
  const lift = root.userData?.profile?.groundLift || 0.18;
  root.position.set(point.x, groundY(olam, point.x, point.z) + lift, point.z);
  root.userData.motion = {
    id: animal.id,
    species,
    homeX: point.x,
    homeZ: point.z,
    phase: index * 0.17,
    seed: index * 17 + species.length,
    radius: radius(animal),
    speed: speed(animal, root),
    vx: 0,
    vz: 0,
    destX: point.x,
    destZ: point.z,
    waypoint: 0,
    wait: 1,
    attackCooldown: 0,
    animTime: 0,
    wingBeat: species === "bird" ? 6 : 0,
    altitude: species === "bird" ? 2.4 : 0,
    groundLift: lift
  };
  root.userData.fullGameplayAnimal = true;
  root.userData.detailedNearAnimal = false;
  restoreFlags(root);
  ensureWildlifeCombat(root, olam);
  sealRegionVisual(root, { ...FLAGS, skipRaycast: false, skipOctree: true, noOctree: true });
  restoreFlags(root);
  return root;
}
