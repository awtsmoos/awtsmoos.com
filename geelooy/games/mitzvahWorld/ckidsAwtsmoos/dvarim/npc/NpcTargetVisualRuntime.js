// B"H
/**
 * @file NpcTargetVisualRuntime.js
 * @description
 * A selected villager deserves visible kavod. The Awtsmoos draws a gold ring
 * beneath the NPC and a small camera-facing hint above him without entering
 * raycasts, octrees, or combat target law.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const VISUAL_NAME = "awtsmoos_friendly_npc_target_visual";
const GOLD = 0xffdc65;
const BLUE = 0x8de8ff;

function seal(node) {
  Object.assign(node.userData ||= {}, {
    friendlyNpcTargetVisual: true,
    skipRaycast: true,
    skipOctree: true,
    noOctree: true,
    addToOctree: false,
    visualOnly: true
  });
}

function makeRing() {
  const geometry = new THREE.RingGeometry(1.05, 1.32, 64);
  const material = new THREE.MeshBasicMaterial({
    color: GOLD,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.name = "friendly_npc_selected_gold_ring";
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.035;
  seal(ring);
  return ring;
}

function makeDisc() {
  const geometry = new THREE.CircleGeometry(1.34, 64);
  const material = new THREE.MeshBasicMaterial({
    color: BLUE,
    transparent: true,
    opacity: 0.13,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const disc = new THREE.Mesh(geometry, material);
  disc.name = "friendly_npc_selected_blue_disc";
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.028;
  seal(disc);
  return disc;
}

function targetRoot(npc) {
  return npc?.mesh || npc?.modelMesh || null;
}

function removeVisual(npc) {
  const root = targetRoot(npc);
  const old = root?.getObjectByName?.(VISUAL_NAME);
  if (!old) return;
  old.removeFromParent();
  old.traverse?.(child => {
    child.geometry?.dispose?.();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(material => material?.dispose?.());
  });
}

export function clearNpcTargetVisual(npc) {
  removeVisual(npc);
}

export function ensureNpcTargetVisual(npc, meta = {}) {
  const root = targetRoot(npc);
  if (!root) return null;

  removeVisual(npc);
  const visual = new THREE.Group();
  visual.name = VISUAL_NAME;
  visual.add(makeDisc(), makeRing());
  visual.position.y = 0.015;
  visual.userData.targetHint = meta.touch
    ? "Tap again when close to talk"
    : "Right-click when close to talk";
  seal(visual);
  root.add(visual);
  return visual;
}

export function clearFriendlyNpcTarget(olam) {
  const npc = olam?.__selectedFriendlyNpc;
  if (!npc) return false;
  clearNpcTargetVisual(npc);
  npc.__targetedAt = 0;
  olam.__selectedFriendlyNpc = null;
  return true;
}
