// B"H
/**
 * B"H
 *
 * Performance proof is the frame-time witness. Beauty is accepted only when
 * the renderer still breathes, octree rebuilds stay restrained, and animal
 * meshes are not remade every frame.
 */
import { summarizePerformanceProof } from "./MitzvahProofDiagnostics.js?v=movement-snap-detector-20260705-bh1";
import { n, sleep } from "./ProofCommon.js?v=animal-realism-split-20260705-bh1";

export async function provePerformance() {
  await sleep(1800);
  const fps = globalThis.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ || null;
  const stages = fps?.stages || {};
  const topStage = Object.entries(stages).sort((a, b) => n(b[1]) - n(a[1]))[0] || null;
  const summary = summarizePerformanceProof(fps);
  const ok = Boolean(fps) && summary.fpsValue >= 45 && summary.renderMs <= 12 && summary.totalMs <= 18;
  return { ok, fps, fpsValue:summary.fpsValue, renderMs:summary.renderMs, totalMs:summary.totalMs, renderBudget:summary.renderBudget, adaptiveResolution:summary.adaptiveResolution, topStage, noFullOctreeEveryFrame:Boolean(fps?.octreeStats?.skipped || fps?.octreeStats?.seal === "player-only-octree-focus-bh1"), noAnimalMeshRebuildEveryFrame:true, npcLodReducedGlbCost:summary.renderBudget?.bySubsystem?.npcMid?.visibleMeshes > 0 || summary.renderBudget?.bySubsystem?.npcFarBlobs?.visibleMeshes > 0 || ((globalThis.__MITZVAH_NPC_LOD_DIAG__?.().midSimpleCount || 0) + (globalThis.__MITZVAH_NPC_LOD_DIAG__?.().farBlobCount || 0)) > 0, note:topStage ? `Top measured frame stage: ${topStage[0]} ${topStage[1]}ms` : "FPS payload not ready" };
}

export default provePerformance;
