// B"H
/**
 * B"H
 *
 * Chossid NPC building now begins with a root, not a network wait.
 * The same chossid GLB used by the player is still the only full-detail body,
 * but it is acquired by near LOD after the village is already playable.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { applyChossidNpcTransform } from "./ChossidNpcTransform.js?v=deferred-npc-glb-20260705-bh1";

export async function buildChossidNpc(olam, def) {
  const npc = new THREE.Group();
  npc.name = def?.id || "npc_chossid_deferred_root";
  Object.assign(npc.userData ||= {}, {
    deferredChossidGlbRoot:true,
    npcGlbDeferredUntilNear:true,
    firstPlayableBlockedByGlb:false,
    npcUsesSameGlbAsPlayer:true
  });
  return applyChossidNpcTransform(npc, def, olam, []);
}
