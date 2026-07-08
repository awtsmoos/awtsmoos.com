// B"H
/**
 * @file WorldFinalReadySignal.js
 * @purpose Emit final readiness without re-running loadedWorld instantiation.
 * @owner mitzvahWorld worker runtime.
 * @inputs Olam render flags plus optional readiness detail.
 * @outputs worker_progress milestones and top-level world_final_ready proof.
 * @runtimeAuthority This is the worker-side final loading gate.
 * @updateOrder postbuild ready + first render -> progress marks -> final proof.
 * @callers heesHawvoos render loop and VillageWorldPolishPass.
 * @invariants never posts final twice; never posts loadedWorld from final stage.
 * @failureModes missing postMessage becomes a safe no-op false boundary.
 */
import { ensureCollisionRuntime } from "../collision/CollisionRuntime.js?compact=true&v=final-ready-proof-20260706-bh1";

const REQUIRED_FRAMES = 2;
const finite = value => Number.isFinite(Number(value));
const vecFinite = value => Boolean(value && finite(value.x) && finite(value.y) && finite(value.z));
const hasFn = (value, name) => typeof value?.[name] === "function";

function playerOf(olam) {
  return olam?.chossid || olam?.player || (olam?.nivrayim || []).find(n => n?.type === "chossid") || null;
}

function objectReady(object) {
  return Boolean(object && object.visible !== false && vecFinite(object.position));
}

function countMatching(olam, predicate) {
  let count = 0;
  for (const n of olam?.nivrayim || []) if (predicate(n, n?.mesh || n?.guf || n?.modelMesh)) count += 1;
  olam?.scene?.traverse?.(node => { if (predicate(node?.nivraAwtsmoos || node, node)) count += 1; });
  return count;
}

function hasFiniteTransforms(olam, limit = 220) {
  let checked = 0;
  let bad = null;
  olam?.scene?.traverse?.(node => {
    if (bad || checked >= limit) return;
    checked += 1;
    const okPosition = !node.position || vecFinite(node.position);
    const okScale = !node.scale || vecFinite(node.scale);
    const okRotation = !node.rotation || [node.rotation.x, node.rotation.y, node.rotation.z].every(finite);
    const okMatrix = !node.matrixWorld?.elements || node.matrixWorld.elements.every(finite);
    if (!okPosition || !okScale || !okRotation || !okMatrix) bad = node.name || node.type || "unnamed-node";
  });
  return { ok:!bad, bad, checked };
}

function collisionProof(olam, player) {
  const runtime = ensureCollisionRuntime(olam);
  const ground = runtime?.ground;
  const playerCollision = runtime?.player;
  const terrainMeshes = ground?.meshes?.size || olam?.__awtsmoosGroundCollisionMeshes?.length || 0;
  const position = player?.collider?.start || player?.mesh?.position || player?.position;
  const hit = position && ground?.groundAt?.(position.x, position.z, {
    fallback:finite(position.y) ? position.y : 0,
    source:"final-readiness-proof"
  });
  return {
    ok:Boolean(runtime && terrainMeshes > 0 && playerCollision && hit && hit.fallback !== true),
    terrainMeshes,
    playerCollisionReady:Boolean(playerCollision),
    groundHit:hit ? { y:hit.y, source:hit.source, fallback:Boolean(hit.fallback), mesh:hit.mesh || null } : null
  };
}

function readinessProof(olam, detail = {}) {
  const player = playerOf(olam);
  const playerObject = player?.mesh || player?.guf || player?.modelMesh || player;
  const camera = olam?.activeCamera || olam?.ayin?.camera || olam?.camera || null;
  const transforms = hasFiniteTransforms(olam);
  const collisions = collisionProof(olam, player);
  const terrainCount = Math.max(collisions.terrainMeshes, countMatching(olam, (n, o) => {
    const data = o?.userData || n?.userData || {};
    return n?.type === "terrain" || data.isTerrain || data.awtsmoosGroundCollider || /terrain|ground/i.test(o?.name || n?.name || "");
  }));
  const grassCount = countMatching(olam, (n, o) => n?.type === "grassPatch" || o?.userData?.grassPatch || /grass/i.test(o?.name || n?.name || ""));
  const npcCount = countMatching(olam, n => /npc|chossid/i.test(n?.type || "") && n !== player);
  const lightCount = countMatching(olam, (n, o) => Boolean(o?.isLight || n?.isLight));
  const playableFrames = olam?.__playableRenderedFrames || 0;
  const checks = {
    rendererAlive:Boolean(olam?.renderer && hasFn(olam.renderer, "render")),
    workerAlive:typeof globalThis.postMessage === "function",
    terrainExists:terrainCount > 0,
    playerExists:objectReady(playerObject),
    cameraValid:objectReady(camera),
    skyRendered:Boolean(olam?.scene?.background || olam?.skySystem || olam?.environment?.skySystem),
    grassRendered:grassCount > 0,
    lightingRendered:lightCount > 0,
    collisionsInitialized:collisions.ok,
    npcRegistryInitialized:npcCount > 0 || Array.isArray(olam?.interactableNivrayim),
    questsInitialized:Boolean(olam?.shlichusHandler || olam?.userProgressManager),
    actionGraphInitialized:Boolean(olam?.yichud || olam?.placementManager || olam?.combatManager),
    animationGraphInitialized:Boolean(player?.mixer || player?.animation || player?.animations || player?.heesHawvoos),
    twoPlayableFrames:playableFrames >= REQUIRED_FRAMES,
    playerStandingOnTerrain:Boolean(player?.onFloor || player?.grounded || player?.isOnGround || playerObject?.userData?.hardGrounded),
    noNaNTransforms:transforms.ok,
    noRenderExceptions:!olam?.__renderPausedAfterFatal
  };
  const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return {
    ok:missing.length === 0,
    missing,
    checks,
    playableFrames,
    terrainCount,
    grassCount,
    npcCount,
    lightCount,
    collisions,
    transforms,
    frame:detail.frame ?? null
  };
}

function ready(olam, detail) {
  return readinessProof(olam, detail).ok;
}

function childCount(olam) {
  return olam?.scene && Array.isArray(olam.scene.children) ? olam.scene.children.length : 0;
}

function post(detail) {
  if (typeof globalThis !== "undefined" && typeof globalThis.postMessage === "function") globalThis.postMessage(detail);
}

function payload(olam, detail) {
  const proof = readinessProof(olam, detail);
  return { at:Date.now(), sceneChildren:childCount(olam), readiness:proof, ...detail };
}

export function signalWorldFinalReady(olam, detail = {}) {
  if (olam?.__firstRenderConfirmed && olam?.__worldPostbuildReady) {
    olam.__playableRenderedFrames = (olam.__playableRenderedFrames || 0) + 1;
  }
  const proof = payload(olam, detail);
  if (!ready(olam, detail)) {
    post({ type:"worker_progress", stage:"world_final_ready:waiting", ...proof });
    return false;
  }
  if (olam.__worldFinalReadyPosted) return true;
  olam.__worldFinalReadyPosted = true;
  post({ type:"worker_progress", stage:"canvas_transferred", ...proof });
  post({ type:"worker_progress", stage:"world_final_ready", hide:true, ...proof });
  post({ type:"world_final_ready", stage:"world_final_ready", hide:true, ...proof });
  return true;
}

export default signalWorldFinalReady;
