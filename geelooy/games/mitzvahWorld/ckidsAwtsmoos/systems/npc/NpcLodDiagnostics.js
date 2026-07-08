// B"H
/**
 * B"H
 *
 * NPC LOD diagnostics are the ledger of restraint: how many neighbors are only
 * simple figures, how many have earned the full GLB, and whether first playable
 * was kept free from a needless model debt.
 */
import { npcGlbNearDiagnostics } from "./lod/NpcGlbNearRuntime.js?compact=true&v=deferred-npc-glb-20260705-bh1";

function tri(node) {
  const g = node?.geometry;
  if (!g) return 0;
  return g.index?.count ? Math.floor(g.index.count / 3) : Math.floor((g.attributes?.position?.count || 0) / 3);
}

function friendly(olam) {
  return (olam?.interactableNivrayim || []).filter(n => ["customNpc", "medabeir", "interactiveNpc"].includes(n?.type));
}
function worldVisible(node) {
  for (let cur = node; cur; cur = cur.parent) if (cur.visible === false) return false;
  return true;
}

export function collectNpcLodDiagnostics(olam) {
  const list = friendly(olam);
  const glb = npcGlbNearDiagnostics();
  const out = {
    friendlyCount:list.length,
    targetableCount:list.filter(n => n?.interactable && (n?.raycastMesh || n?.interactionMesh || n?.mesh)).length,
    nearGlbCount:0,
    midSimpleCount:0,
    farBlobCount:0,
    glbRequestedCount:glb.glbRequestedCount,
    glbLoadedCount:glb.glbLoadedCount,
    glbFailedCount:glb.glbFailedCount,
    glbDeferredUntilNear:glb.glbDeferredUntilNear,
    firstPlayableBlockedByGlb:glb.firstPlayableBlockedByGlb,
    skinnedMeshCount:0,
    npcTriangles:0,
    npcDrawCallsEstimate:0,
    lastTalkName:olam?.__mitzvahNpcDiag?.lastClickedNpc || null,
    dialogueOpen:Boolean(olam?.__mitzvahNpcDiag?.lastDialogueEvent),
    lodSwitches:0
  };
  for (const npc of list) {
    const tier = npc?.mesh?.userData?.npcVisualLodTier || npc?.userData?.npcVisualLodTier;
    const glbLoaded = Boolean(npc?.mesh?.userData?.npcGlbLoaded);
    if (tier === "near" && glbLoaded) out.nearGlbCount++;
    else if (tier === "mid") out.midSimpleCount++;
    else if (tier === "far") out.farBlobCount++;
    else if (tier === "near" && !glbLoaded) out.midSimpleCount++;
    out.lodSwitches += Number(npc?.mesh?.userData?.npcLodSwitches || 0);
    npc?.mesh?.traverse?.(node => {
      if (!worldVisible(node) || !(node.isMesh || node.isSkinnedMesh || node.isInstancedMesh)) return;
      out.npcTriangles += tri(node);
      out.npcDrawCallsEstimate += Math.max(1, Array.isArray(node.material) ? node.material.length : 1);
      if (node.isSkinnedMesh) out.skinnedMeshCount++;
    });
  }
  olam.__mitzvahNpcLodDiag = out;
  globalThis.__MITZVAH_NPC_LOD_DIAG__ = () => out;
  return out;
}

export default collectNpcLodDiagnostics;
