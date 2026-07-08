// B"H
/**
 * @file WildlifeLifeRuntime.js
 * @description
 * Tiered wildlife life conductor. Nearby, selected, and fighting animals keep
 * rich decisions. Passive distant herds keep memory and LOD state but only a
 * small rotating slice performs full brain work per ecology tick.
 */
import { dataOf } from "./LifeMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { thinkWildlife, brainSummary } from "./WildlifeBrain.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buildHerds, herdSummary } from "./HerdManager.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buildFlocks, flockSummary } from "./BirdFlockManager.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { seedWaterPoints } from "./WaterLifeSystem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const LIFE_TICK_SECONDS = 0.34;
const ACTIVE_BRAIN_CAP = 6;

function actorsOf(root) {
  return root?.children?.filter(child => dataOf(child).wildlifeActor) || [];
}

function dist(actor, player) {
  const p = actor?.position || {};
  const q = player || { x:0, z:0 };
  return Math.hypot((p.x || 0) - (q.x || 0), (p.z || 0) - (q.z || 0));
}

function selectedActor(olam) {
  const target = olam?.combatManager?.targeting?.selected || olam?.combatManager?.selectedTarget || olam?.__selectedCombatTarget || null;
  return target?.mesh || target;
}

function tier(actor, player, selected) {
  const data = dataOf(actor);
  if (selected === actor || selected === actor?.mesh || /attack|chase|strike|flee/i.test(String(data.state || data.motion?.state || ""))) return "near";
  const d = dist(actor, player);
  if (d < 18) return "near";
  if (d < 64) return "mid";
  if (d < 150) return "far";
  return "statistical";
}

function dueForTier(tierName, tick, phase) {
  if (tierName === "near") return true;
  if (tierName === "mid") return tick % 12 === phase % 12;
  if (tierName === "far") return tick % 45 === phase % 45;
  return false;
}

function phaseOf(actor, index) {
  const data = dataOf(actor);
  if (Number.isInteger(data.lifePhase)) return data.lifePhase;
  const seed = Number(data.motion?.seed || index || 1);
  data.lifePhase = Math.abs(Math.floor(seed * 13 + index * 7)) % 120;
  return data.lifePhase;
}

function collectActiveActors(store, actors, player, selected) {
  if (!actors.length) return [];
  const active = [];
  const total = actors.length;
  let checked = 0;
  let cursor = Number(store.cursor || 0) % total;
  while (checked < total && active.length < ACTIVE_BRAIN_CAP) {
    const index = cursor % total;
    const actor = actors[index];
    const data = dataOf(actor);
    const tierName = tier(actor, player, selected);
    data.lodTier = tierName;
    if (!data.health?.dead && dueForTier(tierName, store.ticks, phaseOf(actor, index))) active.push(actor);
    cursor += 1;
    checked += 1;
  }
  store.cursor = cursor % total;
  return active;
}

function summary(store, actors, active, groups) {
  return Object.assign(
    { livingEcosystem:true, tieredRuntime:true, actors:actors.length, activeActors:active.length, ticks:store.ticks, activeBrainCap:ACTIVE_BRAIN_CAP },
    brainSummary(active),
    herdSummary(groups.herds),
    flockSummary(groups.flocks)
  );
}

export function createWildlifeLifeRuntime(root, olam, report = {}) {
  const store = {
    ticks:0,
    acc:0,
    cursor:0,
    report,
    waterPoints:seedWaterPoints(),
    summary:null
  };
  const runtime = {
    store,
    tick(dt = 1 / 60) {
      store.acc += Number(dt) || 0;
      if (store.acc < LIFE_TICK_SECONDS) return store.summary;
      store.acc = 0;
      store.ticks += 1;
      const actors = actorsOf(root);
      const player = (olam?.player || olam?.chossid)?.mesh?.position || { x:0, z:0 };
      const active = collectActiveActors(store, actors, player, selectedActor(olam));
      const groups = {
        herds:buildHerds(active),
        flocks:buildFlocks(active)
      };
      const world = {
        dayTime:(Date.now() % 240000) / 240000,
        water:store.waterPoints,
        food:[]
      };
      active.forEach((actor, index) => {
        const data = dataOf(actor);
        const decision = thinkWildlife(actor, active, world, groups, dt, (data.motion?.seed || index) + store.ticks);
        data.lifeDecision = decision;
        if (decision?.state) data.state = decision.state;
      });
      store.summary = summary(store, actors, active, groups);
      root.userData.lifeSummary = store.summary;
      if (olam) olam.__AWTSMOOS_WILDLIFE_LIFE__ = store.summary;
      return store.summary;
    }
  };
  root.userData.lifeRuntime = runtime;
  return runtime;
}

export default createWildlifeLifeRuntime;
