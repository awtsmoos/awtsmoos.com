// B"H
/**
 * B"H
 *
 * The near GLB runtime guards a simple covenant: every NPC uses the same
 * chossid GLB as the player, but no NPC may make first playable wait for it.
 * The full body is requested only when nearness calls, then cached and cloned
 * for every later chossid.
 */
import { loadFreshChossidGltf } from "../../../Olam/worlds/mitzvahWorld/npcs/ChossidNpcLoader.js?v=deferred-npc-glb-20260705-bh1";
import { cloneChossidNpcScene } from "../../../Olam/worlds/mitzvahWorld/npcs/ChossidNpcClone.js?v=awtsmoos-npc-clone-20260614-bh2";
import { applyChossidNpcStyle } from "../../../Olam/worlds/mitzvahWorld/npcs/ChossidNpcStyle.js?v=awtsmoos-npc-style-20260614-bh2";
import { attachChossidNpcAnimator } from "../../../Olam/worlds/mitzvahWorld/npcs/ChossidNpcAnimator.js?v=awtsmoos-npc-animator-lightning-20260701-bh1";

const DIAG = {
  glbRequestedCount:0,
  glbLoadedCount:0,
  glbFailedCount:0,
  glbDeferredUntilNear:true,
  firstPlayableBlockedByGlb:false,
  lastError:null
};

function sceneOf(gltf) {
  return gltf?.scene || gltf?.scenes?.[0] || null;
}

function markGlbVisual(root) {
  root.traverse?.(child => {
    Object.assign(child.userData ||= {}, { npcFullGlbVisual:true, skipOctree:true, noOctree:true });
    if (child.isMesh || child.isSkinnedMesh) {
      child.frustumCulled = true;
      child.castShadow = false;
    }
  });
}

function addLoadedVisual(root, bridge, gltf) {
  const scene = sceneOf(gltf);
  if (!scene) throw new Error("deferred chossid.glb loaded without a scene");
  const visual = cloneChossidNpcScene({ scene });
  visual.name = `${root.name || "npc"}_near_chossid_glb_visual`;
  visual.position.set(0, 0, 0);
  visual.rotation.set(0, 0, 0);
  visual.scale.set(1, 1, 1);
  markGlbVisual(visual);
  applyChossidNpcStyle(visual, bridge?.definition || {});
  root.add(visual);
  root.__npcVisualLod ||= {};
  root.__npcVisualLod.fullChildren = [visual];
  root.userData.npcGlbLoaded = true;
  root.userData.npcGlbLoading = false;
  root.userData.npcUsesSameGlbAsPlayer = true;
  bridge.__npcGlbVisual = visual;
  attachChossidNpcAnimator(visual, gltf.animations || [], bridge);
  return visual;
}

export function npcGlbNearDiagnostics() {
  return { ...DIAG };
}

export function requestNpcNearGlb(root, bridge, olam) {
  if (!root || !bridge || root.userData?.npcGlbLoaded || root.userData?.npcGlbLoading) return root?.__npcGlbPromise || null;
  DIAG.glbRequestedCount += 1;
  root.userData.npcGlbLoading = true;
  root.userData.npcGlbDeferredUntilNear = true;
  root.__npcGlbPromise = loadFreshChossidGltf(olam)
    .then(gltf => {
      const visual = addLoadedVisual(root, bridge, gltf);
      DIAG.glbLoadedCount += 1;
      return visual;
    })
    .catch(error => {
      DIAG.glbFailedCount += 1;
      DIAG.lastError = String(error?.message || error);
      root.userData.npcGlbLoading = false;
      root.userData.npcGlbError = DIAG.lastError;
      return null;
    });
  return root.__npcGlbPromise;
}

export default requestNpcNearGlb;
