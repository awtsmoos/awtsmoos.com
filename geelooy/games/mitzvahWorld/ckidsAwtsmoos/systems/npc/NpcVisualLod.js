// B"H
/**
 * B"H
 *
 * NPC visual LOD is the village's etiquette of nearness.
 * A stable invisible proxy keeps speech and targeting alive from the first
 * playable instant, while the full player-matching chossid GLB waits in cache
 * until the player is close enough for faces, garments, and bones to matter.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { createNpcFarBlob, createNpcMidSimple } from "./lod/NpcSimpleFigureFactory.js?v=deferred-npc-glb-20260705-bh1";
import { desiredNpcLodTier } from "./lod/NpcLodBands.js?v=deferred-npc-glb-20260705-bh1";
import { requestNpcNearGlb } from "./lod/NpcGlbNearRuntime.js?v=deferred-npc-glb-20260705-bh1";
import { collectNpcLodDiagnostics } from "./NpcLodDiagnostics.js?v=deferred-npc-glb-20260705-bh1";

const PROXY_MAT = new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false });

function playerPos(olam) { return (olam?.player || olam?.chossid)?.mesh?.position || null; }
function distanceXZ(a, b) { if (!a || !b) return Infinity; return Math.hypot(a.x - b.x, a.z - b.z); }

function ensureProxy(root, bridge) {
  let proxy = root.getObjectByName?.("AWTSMOOS_NPC_STABLE_INTERACTION_PROXY");
  if (proxy) return proxy;
  proxy = new THREE.Mesh(new THREE.CapsuleGeometry(.55, 1.75, 4, 8), PROXY_MAT.clone());
  proxy.name = "AWTSMOOS_NPC_STABLE_INTERACTION_PROXY";
  proxy.position.set(0, 1.18, 0);
  proxy.visible = true;
  proxy.frustumCulled = false;
  proxy.nivraAwtsmoos = bridge;
  Object.assign(proxy.userData ||= {}, {
    npcInteractionProxy:true,
    interactable:true,
    selectableTarget:true,
    dialogueTarget:true,
    friendlyNpc:true,
    skipRaycast:false,
    skipOctree:true,
    noOctree:true
  });
  root.add(proxy);
  return proxy;
}

function ensureState(root, bridge) {
  if (root.__npcVisualLod) return root.__npcVisualLod;
  const state = {
    tier:"far",
    fullChildren:root.children.filter(child => child.userData?.npcFullGlbVisual),
    mid:createNpcMidSimple(root.name),
    far:createNpcFarBlob(root.name),
    switches:0
  };
  state.mid.visible = false;
  state.far.visible = false;
  root.add(state.mid, state.far);
  const proxy = ensureProxy(root, bridge);
  bridge.raycastMesh = proxy;
  bridge.interactionMesh = proxy;
  bridge.mesh = root;
  root.userData.npcStableInteractionProxy = true;
  root.userData.npcGlbDeferredUntilNear = true;
  root.userData.firstPlayableBlockedByGlb = false;
  root.__npcVisualLod = state;
  return state;
}

function setFullVisible(state, visible) {
  state.fullChildren.forEach(child => {
    if (child === state.mid || child === state.far) return;
    child.visible = visible;
  });
}

export function applyNpcVisualLod(bridge, olam, force = false) {
  const root = bridge?.mesh;
  if (!root?.isObject3D) return "unknown";
  const state = ensureState(root, bridge);
  const next = desiredNpcLodTier(state.tier, distanceXZ(root.position, playerPos(olam)));
  const glbChanged = next === "near" && root.userData?.npcGlbLoaded && root.userData?.npcNearVisualPending;
  if (!force && next === state.tier && !glbChanged) return state.tier;
  if (next !== state.tier) {
    state.tier = next;
    state.switches++;
  }
  if (next === "near") requestNpcNearGlb(root, bridge, olam);
  const hasGlb = Boolean(root.userData?.npcGlbLoaded && state.fullChildren.length);
  setFullVisible(state, next === "near" && hasGlb);
  state.mid.visible = next === "mid" || (next === "near" && !hasGlb);
  state.far.visible = next === "far";
  Object.assign(root.userData ||= {}, {
    npcVisualLodTier:next,
    npcLodSwitches:state.switches,
    npcLodReducedGlbCost:next !== "near" || !hasGlb,
    npcNearVisualPending:next === "near" && !hasGlb,
    npcUsesSameGlbAsPlayer:true
  });
  bridge.userData ||= {};
  bridge.userData.npcVisualLodTier = next;
  collectNpcLodDiagnostics(olam);
  return next;
}

export default applyNpcVisualLod;
