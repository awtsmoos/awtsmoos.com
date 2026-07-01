// B"H
/**
 * PlayerRuntimeProbe
 *
 * Purpose:
 * Reports the worker-owned player runtime state to the main window for browser
 * proof and mobile diagnostics.
 *
 * Runtime owner:
 * ContinuousEventRouter invokes this only when a diagnostic playerProbe message
 * is posted from the main thread.
 *
 * Inputs:
 * The active Olam worker world.
 *
 * Outputs:
 * Plain JSON with player identity, capsule state, model placement, visible
 * render bounds, collision diagnostics, camera state, and recent movement
 * traces.
 *
 * Performance:
 * Debug-only. It measures only the player model tree and never traverses the
 * scene, terrain, house colliders, or distant entities.
 *
 * Fallback:
 * If the player/model is unavailable, fields are null and no fake geometry is
 * reported.
 *
 * Diagnostics:
 * visualBounds shows whether the rendered body bottom is above the capsule feet.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const SEAL = "visible-root-binding-20260610-bh711";
const box = new THREE.Box3();
const childBox = new THREE.Box3();
const tmp = new THREE.Vector3();
const vector = value => value?.toArray?.() || (value ? [Number(value.x), Number(value.y), Number(value.z)] : null);
const names = list => Array.isArray(list) ? list.map(x => x?.name || x?.type || x?.constructor?.name || null) : [];

/** @param {object} olam Active worker world. @returns {object|null} Player entity. */
function playerOf(olam) {
  return olam?.chossid || olam?.player || olam?.nivrayim?.find?.(x => x?.type === "chossid") || null;
}

function visualBoundsOf(root, feetY) {
  if (!root?.isObject3D) return null;
  let renderables = 0;
  let ignored = 0;
  box.makeEmpty();
  root.updateWorldMatrix?.(true, true);
  root.traverse?.(node => {
    if (!node || node.visible === false) return;
    if (node.userData?.visualGroundIgnore) { ignored += 1; return; }
    if (!node.isMesh && !node.isSkinnedMesh) return;
    try {
      childBox.setFromObject(node);
      if (!childBox.isEmpty()) {
        box.union(childBox);
        renderables += 1;
      }
    } catch {}
  });
  if (box.isEmpty()) return { renderables, ignored, empty:true };
  box.getSize(tmp);
  return {
    renderables,
    ignored,
    empty:false,
    min:vector(box.min),
    max:vector(box.max),
    size:vector(tmp),
    bottomDeltaFromFeet:Number.isFinite(feetY) ? box.min.y - feetY : null,
    topDeltaFromFeet:Number.isFinite(feetY) ? box.max.y - feetY : null
  };
}

/** @param {object} olam Active worker world. @returns {object} Plain proof object. */
export function buildPlayerRuntimeProbe(olam) {
  const player = playerOf(olam);
  const root = player?.mesh || null;
  const model = player?.modelMesh || null;
  const fallback = root?.getObjectByName?.("BASIC_VISIBLE_CHOSSID_BODY") || null;
  const chossidim = olam?.nivrayim?.filter?.(x => x?.type === "chossid") || [];
  const camera = olam?.activeCamera || olam?.ayin?.camera || null;
  const radius = Number(player?.collider?.radius || player?.radius || 0);
  const feetY = player?.collider?.start ? Number(player.collider.start.y) - radius : null;
  return {
    seal: SEAL,
    at: Date.now(),
    hasOlam: Boolean(olam),
    chossidCount: chossidim.length,
    samePlayer: Boolean(player && player === olam?.chossid && player === olam?.player),
    inLoop: Boolean(player && olam?.nivrayim?.includes?.(player)),
    ready: Boolean(player?.isReady),
    active: Boolean(player?.heesHawveh),
    name: player?.name || null,
    meshName: root?.name || null,
    modelName: model?.name || null,
    modelParentIsRoot: Boolean(root && model && model.parent === root),
    fallbackPresent: Boolean(fallback),
    meshPos: vector(root?.position),
    modelLocal: vector(model?.position),
    modelScale: vector(model?.scale),
    visualGroundOffsetY: Number(model?.userData?.visualGroundOffsetY || 0),
    visualClamp: player?.__lastVisualGroundClamp || null,
    visualBounds: visualBoundsOf(model || fallback, feetY),
    collisionDiag: globalThis.__AWTS_COLLISION_DIAG__?.() || null,
    bubbleDiag: globalThis.__AWTS_BUBBLE_DIAG__?.() || null,
    colliderStart: vector(player?.collider?.start),
    colliderEnd: vector(player?.collider?.end),
    colliderRadius:Number.isFinite(radius) ? radius : null,
    feetY:Number.isFinite(feetY) ? feetY : null,
    velocity: vector(player?.velocity),
    onFloor: Boolean(player?.onFloor),
    moving: { ...(player?.moving || {}) },
    activeInputs: Object.keys(olam?.inputs || {}).filter(key => olam.inputs[key]),
    cameraTargetIsPlayer: Boolean(olam?.ayin?.target === player),
    cameraPos: vector(camera?.position),
    rootChildren: names(root?.children || []),
    visibleState: player?.__visibleBodyState || null,
    movementTraceTail: olam?.__movementTrace?.slice?.(-100) || [],
    modelLoadTraceTail: globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__?.slice?.(-60) || []
  };
}
