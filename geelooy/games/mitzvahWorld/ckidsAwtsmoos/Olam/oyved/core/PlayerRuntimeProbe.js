// B"H
/**
 * @file PlayerRuntimeProbe.js
 * @description
 * Chapter 428: The worker speaks the hidden body.
 *
 * The Chossid may live inside an OffscreenCanvas worker, beyond the direct gaze
 * of `window.olam`. This probe turns the worker's inner world into plain JSON:
 * player identity, loop membership, model-root covenant, fallback body, camera
 * target, positions, and the last movement/model traces.
 */

const SEAL = "visible-root-binding-20260610-bh710";
const vector = value => value?.toArray?.() || (value ? [Number(value.x), Number(value.y), Number(value.z)] : null);
const names = list => Array.isArray(list) ? list.map(x => x?.name || x?.type || x?.constructor?.name || null) : [];

/** @param {object} olam Active worker world. @returns {object|null} Player entity. */
function playerOf(olam) {
  return olam?.chossid || olam?.player || olam?.nivrayim?.find?.(x => x?.type === "chossid") || null;
}

/** @param {object} olam Active worker world. @returns {object} Plain proof object. */
export function buildPlayerRuntimeProbe(olam) {
  const player = playerOf(olam);
  const root = player?.mesh || null;
  const model = player?.modelMesh || null;
  const fallback = root?.getObjectByName?.("BASIC_VISIBLE_CHOSSID_BODY") || null;
  const chossidim = olam?.nivrayim?.filter?.(x => x?.type === "chossid") || [];
  const camera = olam?.activeCamera || olam?.ayin?.camera || null;
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
    colliderStart: vector(player?.collider?.start),
    colliderEnd: vector(player?.collider?.end),
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
