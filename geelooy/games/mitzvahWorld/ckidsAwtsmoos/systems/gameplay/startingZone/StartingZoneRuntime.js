// B"H
import { npcInteractionIndex } from "../../npc/NpcInteractionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { STARTER_ACTION_BAR } from "./StarterActionBarData.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { addDenseEnemyPack, makeOlam, instantiateSubzoneWorld } from "./StarterActorFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createCreatureBrain } from "./StarterCreatureBrain.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createStarterPerformancePlan } from "./StarterPerformancePlan.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { StarterSpatialPartition } from "./StarterSpatialPartition.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { STARTER_WORLD_REQUIREMENTS } from "./StarterSubzoneData.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createTargetingCombatSystem } from "./StarterTargetingCombat.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { clone, face, nowMs, vec } from "./StarterMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { runStarterServiceLoop } from "./StarterServiceSimulation.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function addCanonicalServiceNpcs(olam) {
  const indexed = npcInteractionIndex().npcs || [];
  indexed.forEach((npc, index) => {
    olam.npcs.push({
      ...npc,
      icon:npc.services?.includes("vendor") ? "🛒" : npc.services?.includes("trainer") ? "📚" : "💬",
      friendly:true,
      role:npc.id,
      subzoneId:"canonical",
      position:vec(-12 + index * 2.7, 12 + (index % 5) * 2.5),
      brainKey:`friendly:${npc.id}`,
      pathOffset:(index * 191) % 1000
    });
  });
  return indexed.length;
}

function createState(olam, clock) {
  return {
    olam,
    currentTarget:null,
    actionBar:clone(STARTER_ACTION_BAR),
    clock,
    frameBudget:{
      targetFps:STARTER_WORLD_REQUIREMENTS.targetFps,
      targetFrameMs:16.67,
      updateBubble:STARTER_WORLD_REQUIREMENTS.updateBubble,
      visibleBubble:STARTER_WORLD_REQUIREMENTS.visibleBubble,
      farBubble:STARTER_WORLD_REQUIREMENTS.farBubble,
      maxActiveEnemies:STARTER_WORLD_REQUIREMENTS.activeEnemyBudget,
      maxActiveNpcs:STARTER_WORLD_REQUIREMENTS.activeNpcBudget
    }
  };
}

export function createStartingZoneMmoRuntime(options = {}) {
  const events = [];
  const clock = options.clock || { now:Date.now };
  const olam = makeOlam(events);
  const canonicalNpcCount = addCanonicalServiceNpcs(olam);
  instantiateSubzoneWorld(olam, canonicalNpcCount);

  const state = createState(olam, clock);
  const spatial = new StarterSpatialPartition(STARTER_WORLD_REQUIREMENTS.spatialCellSize);
  spatial.rebuild([...olam.npcs, ...olam.enemies, ...olam.doors]);

  const ctx = { state, olam, events, clock, spatial };
  const combat = createTargetingCombatSystem(ctx);
  const brain = createCreatureBrain(ctx);

  function serviceLoop() {
    return runStarterServiceLoop(olam, combat);
  }

  function performancePlan() {
    spatial.rebuild([...olam.npcs, ...olam.enemies, ...olam.doors]);
    return createStarterPerformancePlan(state, olam, spatial);
  }

  function spawnDenseEnemyPack(options = {}) {
    const rows = addDenseEnemyPack(olam, options);
    spatial.rebuild([...olam.npcs, ...olam.enemies, ...olam.doors]);
    return rows;
  }

  function runDenseEnemyStress(options = {}) {
    olam.player.position = vec(0, 0);
    const spawned = spawnDenseEnemyPack({ count:options.count || 220, spread:options.spread || 26, center:olam.player.position, hostile:true });
    const ai = brain.enemyTick(16.67);
    const perf = performancePlan();
    const nearby = olam.enemies.filter(e => Math.hypot((e.position.x || 0) - olam.player.position.x, (e.position.z || 0) - olam.player.position.z) <= state.frameBudget.updateBubble);
    return {
      spawned:spawned.length,
      nearby:nearby.length,
      ai,
      perf,
      throttled:nearby.filter(e => /throttled/.test(e.state)).length,
      attacking:nearby.filter(e => ["attack", "charge", "chase", "kite"].includes(e.state)).length,
      sharedBrainLoops:perf.sharedBrainLoops,
      withinBudget:ai.active <= state.frameBudget.maxActiveEnemies && perf.activeWithinBudget
    };
  }

  function runFullSimulation() {
    const service = serviceLoop();
    const fox = olam.enemies.find(e => e.species === "fox");
    const archer = olam.enemies.find(e => e.species === "archer");
    const cow = olam.enemies.find(e => e.species === "cow");
    const door = olam.doors[0];

    olam.player.position = vec(fox.position.x - 3.2, fox.position.z);
    combat.selectTarget(fox.id);
    olam.player.yaw = 0;
    const facingFailure = combat.attackTarget("melee_strike");
    face(olam.player, fox);
    const meleeHits = [];
    while (!fox.dead && meleeHits.length < 5) meleeHits.push(combat.attackTarget("melee_strike"));
    const lootUi = combat.openLoot(fox.corpseId);
    const looted = combat.lootCorpse(fox.corpseId);

    olam.player.position = vec(archer.position.x - 24, archer.position.z);
    combat.selectTarget(archer.id);
    face(olam.player, archer);
    const ranged = combat.attackTarget("ranged_shot");

    olam.player.position = vec(cow.position.x - 12, cow.position.z);
    combat.selectTarget(cow.id);
    const passiveBeforeHit = cow.state;
    face(olam.player, cow);
    const cowHit = combat.attackTarget("staff_letters");

    olam.player.position = vec(door.position.x, door.position.z - 2);
    combat.selectTarget(door.id);
    face(olam.player, door);
    const doorOpen = combat.talkToTarget();

    const ai = brain.enemyTick(1000);
    const beforeRespawn = fox.dead;
    fox.respawnAt = nowMs(clock) - 1;
    brain.enemyTick(16.67);
    const perf = performancePlan();

    return {
      service,
      facingFailure,
      meleeHits,
      lootUi,
      looted,
      ranged,
      passive:{ beforeHit:passiveBeforeHit, afterHit:cow.state, hit:cowHit.ok },
      doorOpen,
      enemyAi:ai,
      enemyStates:olam.enemies.slice(0, 12).map(e => ({ id:e.id, species:e.species, state:e.state, hp:e.hp, dead:e.dead })),
      respawn:{ beforeRespawn, afterRespawn:!fox.dead && fox.hp === fox.maxHp },
      perf,
      actionBar:state.actionBar,
      npcs:olam.npcs.length,
      enemies:olam.enemies.length,
      houses:olam.houses.length,
      roads:olam.roads.length,
      doors:olam.doors.length,
      forestInstances:olam.forest.reduce((sum, row) => sum + row.count, 0),
      events:events.length
    };
  }

  return {
    state,
    spatial,
    selectTarget:combat.selectTarget,
    talkToTarget:combat.talkToTarget,
    attackTarget:combat.attackTarget,
    enemyTick:brain.enemyTick,
    openLoot:combat.openLoot,
    lootCorpse:combat.lootCorpse,
    serviceLoop,
    performancePlan,
    spawnDenseEnemyPack,
    runDenseEnemyStress,
    runFullSimulation
  };
}

export function runStartingZoneMmoContract(options = {}) {
  const runtime = createStartingZoneMmoRuntime(options);
  const result = runtime.runFullSimulation();
  const ok = result.npcs >= STARTER_WORLD_REQUIREMENTS.minFriendlyNpcs &&
    result.enemies >= STARTER_WORLD_REQUIREMENTS.minEnemies &&
    result.houses >= STARTER_WORLD_REQUIREMENTS.minHouses &&
    result.doors >= STARTER_WORLD_REQUIREMENTS.minClickableDoors &&
    result.actionBar.length >= 6 &&
    result.actionBar.every(a => a.icon) &&
    result.facingFailure.reason === "must-face-target" &&
    result.meleeHits.some(hit => hit.killed) &&
    result.lootUi.open === true &&
    result.looted.ok === true &&
    result.ranged.ok === true &&
    result.passive.beforeHit === "idle" &&
    result.passive.hit === true &&
    result.doorOpen.open === true &&
    result.respawn.beforeRespawn === true &&
    result.respawn.afterRespawn === true &&
    result.service.accepted.ok &&
    result.service.turnedIn.ok &&
    result.service.vendor.items.length >= 6 &&
    result.service.trainer.trainers.length >= 4 &&
    result.perf.targetFps === 60 &&
    result.perf.sharedBrainLoops <= 8 &&
    result.perf.activeWithinBudget &&
    result.perf.instancedProps &&
    result.perf.treeLayers >= 5 &&
    result.perf.farAnimalsMostlyIdle &&
    result.perf.roadsSolid &&
    result.perf.doorsClickable;
  return { ok, ...result };
}

export default { createStartingZoneMmoRuntime, runStartingZoneMmoContract };
