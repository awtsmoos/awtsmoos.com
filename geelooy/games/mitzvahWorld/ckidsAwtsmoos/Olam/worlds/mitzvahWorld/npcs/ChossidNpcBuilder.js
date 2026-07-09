// B"H
/**
 * @file ChossidNpcBuilder.js
 * @description Builds one canonical visible chossid.glb NPC root and seals it
 * so later LOD/fallback paths cannot append another humanoid vessel.
 */
import { loadFreshChossidGltf } from "./ChossidNpcLoader.js?compact=true&v=npc-source-body-prune-20260708-bh1";
import { cloneChossidNpcScene } from "./ChossidNpcClone.js?compact=true&v=npc-source-body-prune-20260708-bh1";
import { applyChossidNpcTransform } from "./ChossidNpcTransform.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function markCanonicalLoadedGlbRoot(root) { Object.assign(root.userData ||= {}, { realChossidGlbNpc:true, npcRealChossidGlb:true, npcGlbLoaded:true, npcGlbLoading:false, npcRealChossidGlbReady:true, npcNearVisualPending:false, npcAlreadyHasCanonicalGlbVisual:true, npcGlbDeferredUntilNear:false, firstPlayableBlockedByGlb:false, npcUsesSameGlbAsPlayer:true, chossidGlbVisibleImmediately:true, generatedNpcBodyDisabled:true, oneVisualNpcVessel:true, duplicateNpcBodyPreventedAtSource:true }); root.traverse?.(child => { Object.assign(child.userData ||= {}, { npcRealChossidGlb:true, skipOctree:true, noOctree:true }); if (child.isMesh || child.isSkinnedMesh) { child.visible = true; child.frustumCulled = false; child.castShadow = false; child.receiveShadow = true; } }); }
export async function buildChossidNpc(olam, def) { const envelope = await loadFreshChossidGltf(olam || {}); const npc = cloneChossidNpcScene(envelope); npc.name = def?.id || "npc_chossid_real_glb"; markCanonicalLoadedGlbRoot(npc); console.info('B"H | NPC_CANONICAL_GLB_ROOT_READY', { name:npc.name, source:"cloneChossidNpcScene", nearGlbRequestAllowed:false, sourcePrunedFullBodyBranchCount:npc.userData.npcSourcePrunedFullBodyBranchCount || 0, visibleFullBodyBranches:npc.userData.npcVisibleFullBodyBranches || 1, seal:"one-canonical-root-no-second-append-20260708-bh2" }); return applyChossidNpcTransform(npc, def, olam, envelope.animations || []); }
