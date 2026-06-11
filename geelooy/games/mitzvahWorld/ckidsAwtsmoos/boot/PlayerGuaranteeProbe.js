// B"H
/**
 * @file PlayerGuaranteeProbe.js
 * @description
 * Chapter 444: The browser gate asks the hidden Chossid for testimony.
 *
 * The Awtsmoos lets the visible body live partly in a worker and partly in the
 * page. This module installs small global probes that inspect any main-thread
 * Olam copy and request the true worker-side player report.
 */
const vectorArray = v => v?.toArray?.() || (v ? [Number(v.x), Number(v.y), Number(v.z)] : null);

function activeOlam(scope) {
  return scope.olam || scope.mana?.socket?.olam || scope.mana?.socket?.runtime?.olam || scope.mana?.olam || null;
}

function activePlayer(world) {
  return world?.chossid || world?.player || world?.nivrayim?.find?.(x => x?.type === "chossid") || null;
}

function activeWorkerManager(scope) {
  return scope.__AWTSMOOS_ACTIVE_WORKER_MANAGER__ || scope.mana?.socket || null;
}

function mainThreadProbe(scope, seal) {
  const world = activeOlam(scope);
  const player = activePlayer(world);
  const chossidim = world?.nivrayim?.filter?.(x => x?.type === "chossid") || [];
  const model = player?.modelMesh || null;
  const root = player?.mesh || null;
  const fallback = root?.getObjectByName?.("BASIC_VISIBLE_CHOSSID_BODY") || null;
  const camera = world?.activeCamera || world?.ayin?.camera || null;
  return {
    seal,
    source: "main-thread",
    hasWorld: Boolean(world),
    samePlayer: Boolean(player && player === world?.player && player === world?.chossid),
    chossidCount: chossidim.length,
    inLoop: Boolean(player && world?.nivrayim?.includes?.(player)),
    ready: Boolean(player?.isReady),
    active: Boolean(player?.heesHawveh),
    meshName: root?.name || null,
    modelName: model?.name || null,
    modelParentIsRoot: Boolean(model && root && model.parent === root),
    fallbackPresent: Boolean(fallback),
    meshPos: vectorArray(root?.position),
    modelLocal: vectorArray(model?.position),
    cameraTargetIsPlayer: Boolean(world?.ayin?.target === player),
    cameraPos: vectorArray(camera?.position),
    rootChildren: root?.children?.map?.(x => x.name || x.type) || [],
    visibleState: player?.__visibleBodyState || null,
    movementTraceTail: world?.__movementTrace?.slice?.(-80) || [],
    modelLoadTraceTail: scope.__AWTSMOOS_MODEL_LOAD_TRACE__?.slice?.(-40) || []
  };
}

function requestWorkerProbe(scope, seal) {
  const manager = activeWorkerManager(scope);
  const id = `playerProbe-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (!manager?.postMessage) return { ok: false, reason: "missing-worker-manager", main: mainThreadProbe(scope, seal) };
  manager.postMessage({ playerProbe: { id, seal } });
  return { ok: true, id, seal, latest: scope.__AWTSMOOS_LAST_PLAYER_PROBE__ || null };
}

/**
 * Installs visible-root probe globals on the given browser scope.
 *
 * @param {Window} scope Browser window.
 * @param {string} seal Active cache/proof seal.
 * @returns {void}
 */
export function installPlayerGuaranteeProbe(scope, seal) {
  scope.__AWTSMOOS_VISIBLE_ROOT_SEAL__ = seal;
  scope.__AWTSMOOS_GET_ACTIVE_OLAM__ = () => activeOlam(scope);
  scope.__AWTSMOOS_ASSERT_PLAYER_BODY__ = () => mainThreadProbe(scope, seal);
  scope.__AWTSMOOS_REQUEST_PLAYER_PROBE__ = () => requestWorkerProbe(scope, seal);
}
