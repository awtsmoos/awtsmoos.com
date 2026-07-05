// B"H
/**
 * @file RegionWildlifeMotion.js
 * @description
 * Creature decisions and movement. The Awtsmoos lets foxes hunt, rabbits flee,
 * birds rise, and every animal return to its ground-truth path.
 */
import { decisionFromWildlifeCombat } from "../../../../../systems/creatures/WildlifeCombatAdapter.js";
import { getDynamicActorPartition } from "../../runtime/DynamicActorPartition.js?v=perf-tight-collision-20260703-bh3";
import { animateAnimal } from "../wildlife/render/AnimalAnimator.js?v=animal-lod-wire-20260622-bh1";
import { groundY } from "./RegionGround.js";
import { FAST, distance2, length2d, playerMesh } from "./RegionWildlifeData.js?v=perf-tight-collision-20260703-bh4";

function nearest(root, species, from) {
  let best = null;
  let distance = Infinity;
  for (const child of root.children) {
    const motion = child.userData?.motion;
    if (!motion || motion.species !== species) continue;
    const next = Math.sqrt(distance2(child.position, from.position));
    if (next < distance) { best = child; distance = next; }
  }
  return { best, distance };
}

function oldChoose(root, animal, motion, olam) {
  const player = playerMesh(olam), pos = player?.position, pd = pos ? Math.sqrt(distance2(animal.position, pos)) : Infinity;
  if (motion.species === "bird") return pos && pd < 10 ? { state: "swoop", target: pos, player: false } : { state: "flock" };
  if (motion.species === "fox" && pos && pd < 16) return { state: pd < 2.6 ? "attack" : "hunt", target: pos, player: true };
  if (motion.species === "fox") { const prey = nearest(root, "rabbit", animal); if (prey.best && prey.distance < 30) return { state: prey.distance < 2.4 ? "attack" : "hunt", target: prey.best.position }; }
  if (motion.species === "rabbit") { const predator = nearest(root, "fox", animal); if (predator.best && predator.distance < 24) return { state: "flee", target: predator.best.position }; }
  if (motion.species === "deer" && pos && pd < 17) return { state: "fleePlayer", target: pos };
  if (motion.wait > 0) return { state: motion.species === "frog" ? "drink" : "graze" };
  return { state: motion.species === "goat" ? "climb" : "wander" };
}

function choose(root, animal, motion, olam) {
  return normalizeDecision(decisionFromWildlifeCombat(animal, olam), olam) || normalizeDecision(animal.userData?.lifeDecision, olam) || oldChoose(root, animal, motion, olam);
}

function normalizeDecision(decision, olam) {
  if (!decision) return null;
  if (decision.state) return decision;
  const action = String(decision.action || "").toLowerCase();
  if (!action || action === "idle") return null;
  if (action === "return_home") return { ...decision, state:"return_home" };
  if (action === "chase") return { ...decision, state:"hunt", target:playerMesh(olam)?.position || decision.target, player:true };
  if (action === "patrol") return { ...decision, state:"wander" };
  if (action === "attack") return { ...decision, state:"attack", target:playerMesh(olam)?.position || decision.target, player:true };
  return { ...decision, state:action };
}

function chooseWaypoint(motion) {
  motion.waypoint++;
  const angle = ((motion.seed + motion.waypoint * 17) % 360) * Math.PI / 180;
  const range = (0.35 + ((motion.seed + motion.waypoint) % 40) / 100) * motion.radius;
  motion.destX = motion.homeX + Math.cos(angle) * range;
  motion.destZ = motion.homeZ + Math.sin(angle) * range * 0.72;
  motion.wait = 0.7 + ((motion.waypoint + motion.seed) % 25) / 10;
}

function target(animal, motion, decision) {
  if (decision.state === "return_home") return { x: motion.homeX, z: motion.homeZ };
  if (!decision.target) return { x: motion.destX, z: motion.destZ };
  const tx = decision.target.x ?? decision.target.position?.x ?? motion.destX;
  const tz = decision.target.z ?? decision.target.position?.z ?? motion.destZ;
  const dx = tx - animal.position.x, dz = tz - animal.position.z;
  return String(decision.state).toLowerCase().includes("flee") ? { x: animal.position.x - dx, z: animal.position.z - dz } : { x: tx, z: tz };
}

function damagePlayer(olam, motion, delta) {
  motion.attackCooldown = Math.max(0, (motion.attackCooldown || 0) - delta);
  if (motion.attackCooldown > 0) return;
  motion.attackCooldown = 1.35;
  const player = olam && (olam.player || olam.chossid);
  if (typeof player?.takeDamage === "function") player.takeDamage(4);
  else player?.ayshPeula?.("damage", { amount: 4, source: "wildlife" });
}

function partitionFor(olam) {
  const budget = globalThis?.__AWTSMOOS_PERFORMANCE_MODE__?.budget || {};
  return getDynamicActorPartition(olam).configure({
    near: budget.npcDistance || 48,
    mid: (budget.npcDistance || 48) * 1.8,
    far: (budget.treeDistance || 120) * 2.2,
    budget:{ critical:12, near:10, mid:4, far:2, sleep:1 }
  });
}

function birdAltitude(motion, decision) {
  const flap = Math.sin(motion.animTime * motion.wingBeat + motion.phase) * 0.58;
  if (["landNest", "hopPeck"].includes(decision.state)) return 0.35;
  if (["swoop", "takeoffAlarm"].includes(decision.state)) return Math.max(2.4, motion.altitude - 1.5 + flap);
  return motion.altitude + flap + Math.sin(motion.animTime * 0.7 + motion.phase) * 0.95;
}

function moveAnimal(animal, motion, decision, olam, delta) {
  motion.animTime += delta;
  if (distance2(animal.position, { x: motion.destX, z: motion.destZ }) < 2.2) { motion.wait = Math.max(0, motion.wait - delta); if (motion.wait <= 0) chooseWaypoint(motion); }
  const goal = target(animal, motion, decision), dx = goal.x - animal.position.x, dz = goal.z - animal.position.z, dist = length2d(dx, dz);
  const active = dist > 0.35 && !["graze", "drink", "attack", "eat", "socialIdle"].includes(decision.state);
  const scale = active ? motion.speed * (FAST.has(decision.state) ? 2.15 : 0.72) / dist : 0;
  motion.vx += (dx * scale - motion.vx) * (1 - Math.exp(-delta * 4.5));
  motion.vz += (dz * scale - motion.vz) * (1 - Math.exp(-delta * 4.5));
  animal.position.x += motion.vx * delta;
  animal.position.z += motion.vz * delta;
  animal.position.y = groundY(olam, animal.position.x, animal.position.z) + (motion.groundLift || 0.035) + (motion.species === "bird" ? birdAltitude(motion, decision) : 0);
  if (motion.vx * motion.vx + motion.vz * motion.vz > 0.004) animal.rotation.y = Math.atan2(motion.vx, motion.vz);
  if (decision.player && decision.state === "attack") damagePlayer(olam, motion, delta);
}

export function tickWildlife(root, olam, dt = 1 / 60) {
  const delta = Math.min(0.05, Math.max(0.001, Number(dt) || 1 / 60));
  const partition = partitionFor(olam);
  root.userData.lifeRuntime?.tick(delta, partition);
  for (const child of root.children) {
    const motion = child.userData?.motion;
    if (!motion || !partition.shouldUpdate(child, olam)) continue;
    if (child.userData.health?.dead) { animateAnimal(child, delta, "death"); continue; }
    const decision = choose(root, child, motion, olam);
    motion.state = decision.state;
    moveAnimal(child, motion, decision, olam, delta);
    animateAnimal(child, delta, motion.state);
    child.userData.state = motion.state;
    child.userData.creatureCombatState = child.__creatureState || child.userData.creatureCombatState;
  }
}
