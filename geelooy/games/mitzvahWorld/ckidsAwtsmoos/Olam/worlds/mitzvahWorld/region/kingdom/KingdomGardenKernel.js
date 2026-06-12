// B"H
/**
 * @file KingdomGardenKernel.js
 * @description A finite vessel for an infinite-feeling green kingdom, fast because it is humble.
 */
import { createKingdomPerformanceBudget, measureBudgetPressure, budgetSummary } from "./KingdomPerformanceBudget.js";
import { createKingdomWorldClock } from "./KingdomWorldClock.js";
import { buildKingdomChunkMap } from "./KingdomChunkMap.js";
import { buildKingdomSpatialIndex } from "./KingdomSpatialIndex.js";
import { createKingdomEventBus, kingdomEmit, eventBusSummary } from "./KingdomEventBus.js";
import { createKingdomProofLedger, recordKingdomProof, proofLedgerSummary } from "./KingdomProofLedger.js";
import { createKingdomSaveSnapshot, snapshotSummary } from "./KingdomSaveSnapshot.js";
import { createInterestBubble } from "../simulation/InterestBubble.js";
import { assignChunkTiers } from "../simulation/SimulationTierModel.js";
import { createSimulationScheduler, scheduleTask, schedulerSummary } from "../simulation/SimulationScheduler.js";

export function buildKingdomGardenKernel(data = {}) {
  const clock = createKingdomWorldClock(data.now || Date.now());
  const bubble = createInterestBubble(data.player || { x: 0, z: 0 });
  const rawChunks = buildKingdomChunkMap(data);
  const chunks = assignChunkTiers(rawChunks, bubble);
  const spatial = buildKingdomSpatialIndex(data);
  const demand = demandFromData(data, chunks);
  const budget = measureBudgetPressure(createKingdomPerformanceBudget(data.budgetCaps), demand);
  let events = createKingdomEventBus();
  events = kingdomEmit(events, "kingdom.kernel.ready", { chunks: chunks.summary.chunks, mode: budget.mode }, clock.now);
  let proof = createKingdomProofLedger();
  proof = recordKingdomProof(proof, "chunks-created", chunks.summary.chunks > 0, chunks.summary);
  proof = recordKingdomProof(proof, "budget-bounded", Boolean(budget.mode), budgetSummary(budget));
  proof = recordKingdomProof(proof, "spatial-index-created", spatial.summary.buckets > 0, spatial.summary);
  const scheduler = seedScheduler(createSimulationScheduler(), chunks);
  const kernel = { version: "kingdom-garden-kernel-v1", clock, bubble, chunks, spatial, budget, events, proof, scheduler };
  const snapshot = createKingdomSaveSnapshot({ ...kernel, summary: summarize(kernel) });
  return { ...kernel, snapshot, summary: summarize({ ...kernel, snapshot }) };
}

function demandFromData(data, chunks) {
  const instances = data.instances?.summary?.total || 0;
  return {
    activeChunks: chunks.summary.activeChunks || 0,
    activeNpcs: Math.min(20, data.npcSchedules?.schedules?.length || 0),
    activeAnimals: Math.min(80, data.wildlife?.animals?.length || 0),
    visibleInstances: instances,
    hardColliders: data.colliders?.hard?.length || 0,
    eventsPerTick: 1
  };
}

function seedScheduler(scheduler, chunks) {
  let out = scheduler;
  for (const chunk of chunks.chunks || []) out = scheduleTask(out, `chunk:${chunk.id}`, chunk.tier, Math.max(1, 4 - chunk.tier));
  return out;
}

function summarize(kernel) {
  return {
    ok: true,
    version: kernel.version,
    chunks: kernel.chunks?.summary?.chunks || 0,
    activeChunks: kernel.chunks?.summary?.activeChunks || 0,
    tiers: kernel.chunks?.summary?.tiers || {},
    budget: budgetSummary(kernel.budget),
    spatial: kernel.spatial?.summary || {},
    events: eventBusSummary(kernel.events),
    proof: proofLedgerSummary(kernel.proof),
    scheduler: schedulerSummary(kernel.scheduler),
    snapshot: snapshotSummary(kernel.snapshot)
  };
}
