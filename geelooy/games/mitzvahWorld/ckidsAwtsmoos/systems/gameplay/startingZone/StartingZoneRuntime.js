// B"H
import { npcInteractionIndex } from "../../npc/NpcInteractionRuntime.js";
import { STARTER_ACTION_BAR } from "./StarterActionBarData.js";
import { makeOlam, instantiateSubzoneWorld } from "./StarterActorFactory.js";
import { createCreatureBrain } from "./StarterCreatureBrain.js";
import { createStarterPerformancePlan } from "./StarterPerformancePlan.js";
import { StarterSpatialPartition } from "./StarterSpatialPartition.js";
import { STARTER_WORLD_REQUIREMENTS } from "./StarterSubzoneData.js";
import { createTargetingCombatSystem } from "./StarterTargetingCombat.js";
import { clone, face, nowMs, vec } from "./StarterMath.js";
import { runStarterServiceLoop } from "./StarterServiceSimulation.js";

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
