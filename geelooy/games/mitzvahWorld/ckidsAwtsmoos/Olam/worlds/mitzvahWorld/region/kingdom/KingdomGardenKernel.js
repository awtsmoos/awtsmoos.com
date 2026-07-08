// B"H
/** @file KingdomGardenKernel.js @description Finite vessel for an infinite-feeling green kingdom, parser-clear. */
import { createKingdomPerformanceBudget, measureBudgetPressure, budgetSummary } from "./KingdomPerformanceBudget.js?compact=true&v=awtsmoos-budget-20260614-bh2";
import { createKingdomWorldClock } from "./KingdomWorldClock.js?compact=true&v=awtsmoos-clock-20260614-bh2";
import { buildKingdomChunkMap } from "./KingdomChunkMap.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buildKingdomSpatialIndex } from "./KingdomSpatialIndex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createKingdomEventBus, kingdomEmit, eventBusSummary } from "./KingdomEventBus.js?compact=true&v=awtsmoos-event-bus-20260614-bh2";
import { createKingdomProofLedger, recordKingdomProof, proofLedgerSummary } from "./KingdomProofLedger.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createKingdomSaveSnapshot, snapshotSummary } from "./KingdomSaveSnapshot.js?compact=true&v=awtsmoos-save-snapshot-20260614-bh2";
import { createInterestBubble } from "../simulation/InterestBubble.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { assignChunkTiers } from "../simulation/SimulationTierModel.js?compact=true&v=awtsmoos-tier-model-20260614-bh2";
import { createSimulationScheduler, scheduleTask, schedulerSummary } from "../simulation/SimulationScheduler.js?compact=true&v=awtsmoos-scheduler-20260614-bh2";
function instancesTotal(data) { return data && data.instances && data.instances.summary ? data.instances.summary.total || 0 : 0; }
function npcCount(data) { return data && data.npcSchedules && Array.isArray(data.npcSchedules.schedules) ? data.npcSchedules.schedules.length : 0; }
function animalCount(data) { return data && data.wildlife && Array.isArray(data.wildlife.animals) ? data.wildlife.animals.length : 0; }
function hardCount(data) { return data && data.colliders && Array.isArray(data.colliders.hard) ? data.colliders.hard.length : 0; }
function demandFromData(data, chunks) { return { activeChunks:chunks.summary.activeChunks || 0, activeNpcs:Math.min(20, npcCount(data)), activeAnimals:Math.min(80, animalCount(data)), visibleInstances:instancesTotal(data), hardColliders:hardCount(data), eventsPerTick:1 }; }
function seedScheduler(scheduler, chunks) { let out = scheduler; for (const chunk of chunks.chunks || []) out = scheduleTask(out, `chunk:${chunk.id}`, chunk.tier, Math.max(1, 4 - chunk.tier)); return out; }
function summarize(kernel) { const chunkSummary = kernel.chunks && kernel.chunks.summary ? kernel.chunks.summary : {}; const spatialSummary = kernel.spatial && kernel.spatial.summary ? kernel.spatial.summary : {}; return { ok:true, version:kernel.version, chunks:chunkSummary.chunks || 0, activeChunks:chunkSummary.activeChunks || 0, tiers:chunkSummary.tiers || {}, budget:budgetSummary(kernel.budget), spatial:spatialSummary, events:eventBusSummary(kernel.events), proof:proofLedgerSummary(kernel.proof), scheduler:schedulerSummary(kernel.scheduler), snapshot:snapshotSummary(kernel.snapshot) }; }
export function buildKingdomGardenKernel(data = {}) {
  const clock = createKingdomWorldClock(data.now || Date.now()), bubble = createInterestBubble(data.player || { x:0, z:0 });
  const rawChunks = buildKingdomChunkMap(data), chunks = assignChunkTiers(rawChunks, bubble), spatial = buildKingdomSpatialIndex(data);
  const demand = demandFromData(data, chunks), budget = measureBudgetPressure(createKingdomPerformanceBudget(data.budgetCaps), demand);
  let events = createKingdomEventBus(); events = kingdomEmit(events, "kingdom.kernel.ready", { chunks:chunks.summary.chunks, mode:budget.mode }, clock.now);
  let proof = createKingdomProofLedger(); proof = recordKingdomProof(proof, "chunks-created", chunks.summary.chunks > 0, chunks.summary); proof = recordKingdomProof(proof, "budget-bounded", Boolean(budget.mode), budgetSummary(budget)); proof = recordKingdomProof(proof, "spatial-index-created", spatial.summary.buckets > 0, spatial.summary);
  const scheduler = seedScheduler(createSimulationScheduler(), chunks), kernel = { version:"kingdom-garden-kernel-v2-parser-clear", clock, bubble, chunks, spatial, budget, events, proof, scheduler };
  const snapshot = createKingdomSaveSnapshot(Object.assign({}, kernel, { summary:summarize(kernel) })); return Object.assign({}, kernel, { snapshot, summary:summarize(Object.assign({}, kernel, { snapshot })) });
}
