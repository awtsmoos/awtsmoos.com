// B"H
/**
 * LivingWorldRuntime
 * The coordinator now names its layers: Reality state, Simulation pulse policy,
 * and Presentation bus. Budgeted frames remain tiny; full steps remain rich;
 * direct actions flush durable state.
 */
import * as State from './LivingWorldState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { hydrateLivingWorldFromWorldState, persistLivingWorldToWorldState, livingWorldPersistenceSummary } from './LivingWorldPersistenceBridge.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { applyEconomyPricing } from '../economy/EconomyPricingRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { applyVendorPurchase } from '../economy/EconomyTransactionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createNpcScheduleRuntime } from '../npc/NpcScheduleRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createNpcMemoryRuntime } from '../npc/NpcMemoryRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { openNpcInteraction, npcInteractionIndex } from '../npc/NpcInteractionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createRumor, propagateRumors } from '../npc/GossipRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createMissionRuntime } from '../missions/MissionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { progressActiveObjectives } from '../missions/MissionObjectiveRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createReputationRuntime } from '../reputation/ReputationRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createWorldEventRuntime } from '../world/WorldEventRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createWorldEventDirectorRuntime } from '../world/WorldEventDirectorRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createProfessionRuntime } from '../professions/ProfessionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createVillageActivityScheduler } from '../village/VillageActivitySchedulerRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { pulsePolicy, framePolicy } from '../core/SimulationPulsePolicy.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { publishLivingWorld } from '../ui/WorldPresentationBus.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { advanceVillageForPolicy, budgetedLivingWorldFrame } from './LivingWorldFrameStep.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const SAVE_INTERVAL_MS = 1500;
function cap(scope) { const b = scope.__MITZVAH_WORLD_REALISM_BUDGET__ || {}; return Math.max(1, Math.min(5, Number(b.scheduler?.maxTasksPerTick || b.maxTasksPerTick || 3))); }
function ensureStore(scope, options) { const loaded = State.loadLivingWorldState(); const raw = options.store || scope.__MITZVAH_WORLD_STATE__ || loaded; const hydrated = options.skipWorldStateHydration ? raw : hydrateLivingWorldFromWorldState(raw); scope.__MITZVAH_WORLD_STATE__ = State.normalizeLivingWorldState(hydrated); applyEconomyPricing(scope.__MITZVAH_WORLD_STATE__, { reason:'runtime-hydrate' }); return scope.__MITZVAH_WORLD_STATE__; }
function price(store, reason) { applyEconomyPricing(store, { reason:String(reason || 'living-world') }); State.commitUiPayloads(store); return store.economy?.prices || {}; }
function saveBoth(store, reason = 'living-world-runtime') { price(store, reason); const saved = State.saveLivingWorldState(store); persistLivingWorldToWorldState(saved, { reason:String(reason) }); return saved; }
function normalizeOptions(options) { return typeof options === 'object' && options ? options : {}; }

export function createLivingWorldRuntime(scope = globalThis, options = {}) {
  const store = ensureStore(scope, options);
  const npcs = store.npcs;
  const scheduleRuntime = createNpcScheduleRuntime(npcs);
  const memoryRuntime = createNpcMemoryRuntime(store);
  const missionRuntime = createMissionRuntime(store);
  const reputationRuntime = createReputationRuntime(store);
  const worldEvents = createWorldEventRuntime(store);
  const worldEventDirector = createWorldEventDirectorRuntime(store, scope);
  const professions = createProfessionRuntime(store);
  const villageScheduler = createVillageActivityScheduler(store, scope);
  const runtimeState = { started:false, ticks:0, lastStep:null, dirty:false, lastSavedAt:0, skippedSaves:0 };
  function markDirty() { runtimeState.dirty = true; return runtimeState; }
  function maybeSave(reason, policy, opts = {}) {
    const now = Date.now();
    if (!policy.shouldPersist()) { markDirty(); runtimeState.skippedSaves += 1; return null; }
    if (opts.throttle && !opts.force && runtimeState.lastSavedAt && now - runtimeState.lastSavedAt < (opts.saveIntervalMs || SAVE_INTERVAL_MS)) { markDirty(); runtimeState.skippedSaves += 1; return null; }
    const saved = saveBoth(store, reason);
    runtimeState.dirty = false;
    runtimeState.lastSavedAt = now;
    return saved;
  }
  function flush(reason = 'manual-flush') { const saved = saveBoth(store, reason); runtimeState.dirty = false; runtimeState.lastSavedAt = Date.now(); return saved; }
  function applySchedules(hour, policy) { const rows = scheduleRuntime.tick(hour, { maxTasksPerTick:policy.budgeted ? 1 : cap(scope) }, store); for (const row of rows) { State.addMovementIntent(store, row.movementIntent); State.addMemory(store, row.npcId, { kind:'schedule_seen', text:`Went to ${row.place} for ${row.role}.`, role:row.role, place:row.place }); } return rows; }
  function applyCausalPlayerEcho(policy) { if (policy.budgeted && !policy.shouldRunEvery(20)) return null; const memory = State.addMemory(store, 'miriam_baker', { kind:'delivered', text:'The player delivered bread.', fact:'bread_delivery' }); if (!store.rumors.some(r => r.topic === 'bread_delivery')) State.addRumor(store, createRumor('miriam_baker', 'The player delivered bread.', 'bread_delivery')); reputationRuntime.add('reliability', 'village', 1); return memory; }
  function applyEconomyAndMissions() { if ((store.economy.bread || 0) < 3 && !store.activeMissions.deliver_flour_for_bread_shortage) missionRuntime.accept('deliver_flour_for_bread_shortage'); if (store.villageProjects.farmerSick && !store.activeMissions.bring_soup_to_sick_farmer) missionRuntime.accept('bring_soup_to_sick_farmer'); if ((store.villageProjects.benchRepair || 0) < 1 && !store.activeMissions.repair_beis_midrash_bench) missionRuntime.accept('repair_beis_midrash_bench'); return missionRuntime.all(); }
  function step(reason = 'tick', hour = store.clockHour, rawOptions = {}) {
    const opts = normalizeOptions(rawOptions);
    const policy = pulsePolicy(opts, runtimeState.ticks);
    store.clockHour = hour;
    const village = advanceVillageForPolicy(store, villageScheduler, hour, reason, policy);
    const directedEvent = policy.shouldRunStory() ? worldEventDirector.pulse(`step:${reason}`, { phase:village.phase, persist:false, emit:policy.emit }) : null;
    const schedule = applySchedules(hour, policy);
    const event = policy.shouldRunStory() ? worldEvents.ambient(reason) : null;
    const missionsBeforeCraft = policy.shouldRunEconomy() ? applyEconomyAndMissions() : null;
    const crafted = policy.shouldRunEconomy() ? professions.craft('challah', 'miriam_baker') : null;
    applyCausalPlayerEcho(policy);
    const rumors = policy.shouldRunRumors() ? propagateRumors(store, npcs.map(n => n.id)) : store.rumors;
    if (crafted) progressActiveObjectives(missionRuntime, 'deliver_flour', 1);
    const prices = policy.shouldRunEconomy() ? price(store, `step:${reason}`) : (store.economy?.prices || {});
    const missions = missionRuntime.all();
    runtimeState.ticks += 1;
    runtimeState.lastStep = { reason, village, directedEvent, schedule, event, crafted, rumors, missionsBeforeCraft, missions, prices, uiPayloads:store.uiPayloads, reputation:reputationRuntime.snapshot(), budgeted:policy.budgeted };
    maybeSave(`step:${reason}`, policy, opts);
    return publishLivingWorld(scope, 'step', runtimeState.lastStep, { emit:policy.emit });
  }
  const api = { state:runtimeState, store, npcs, scheduleRuntime, villageScheduler, worldEventDirector, memoryRuntime, missionRuntime, reputationRuntime, worldEvents, professions,
    start(reason = 'manual') { runtimeState.started = true; State.addEventFeed(store, { type:'living-world-start', reason }); flush(`start:${reason}`); return api; },
    stop(reason = 'manual') { runtimeState.started = false; State.addEventFeed(store, { type:'living-world-stop', reason }); flush(`stop:${reason}`); return api; },
    step,
    frame(reason = 'frame', hour = store.clockHour) { framePolicy(runtimeState.ticks); return budgetedLivingWorldFrame(store, runtimeState, reason, hour); },
    flush,
    villageHour(hour, reason = 'manual') { const result = villageScheduler.advanceTo(hour, reason, { persist:false }); flush(`village:${result.phase}`); return result; },
    directWorldEvent(reason = 'manual', options = {}) { const result = worldEventDirector.pulse(reason, { ...options, persist:false }); flush(`world-event:${result?.id || 'none'}`); return result; },
    speakToNpc(npcId, context = {}) { return openNpcInteraction(npcId, { ...context, store }, npcs); },
    acceptMission(id) { const result = missionRuntime.accept(id); flush(`accept:${id}`); return result; },
    progress(kind, amount = 1) { const result = progressActiveObjectives(missionRuntime, kind, amount); flush(`progress:${kind}`); return result; },
    completeMission(id) { const done = missionRuntime.finish(id); if (done) { reputationRuntime.applyReward(done.reward); State.addMemory(store, done.sourceNpc || 'miriam_baker', { kind:done.reward?.memory || 'helped', text:`Completed ${done.title}.` }); flush(`complete:${id}`); } return done; },
    remember(npcId, event) { const result = memoryRuntime.remember(npcId, event); flush(`remember:${npcId}`); return result; },
    craft(id, crafter) { const result = professions.craft(id, crafter); flush(`craft:${id}`); return result; },
    buyVendorItem(item, ctx = {}) { const result = applyVendorPurchase(item, { ...ctx, store }); flush(`vendor-buy:${item?.id || item}`); return result; },
    reprice(reason = 'manual') { return price(store, reason); },
    persist(reason = 'manual') { return persistLivingWorldToWorldState(store, { reason }); },
    persistenceSummary() { return livingWorldPersistenceSummary(); },
    snapshot() { price(store, 'snapshot'); return { state:State.loadLivingWorldState(), store, npcIndex:npcInteractionIndex(npcs), village:villageScheduler.snapshot(), worldEventDirector:worldEventDirector.snapshot(), lastStep:runtimeState.lastStep, uiPayloads:store.uiPayloads, persistence:livingWorldPersistenceSummary(), dirty:runtimeState.dirty }; }
  };
  scope.__MITZVAH_WORLD_LIVING_WORLD__ = api;
  return api;
}
export default createLivingWorldRuntime;
