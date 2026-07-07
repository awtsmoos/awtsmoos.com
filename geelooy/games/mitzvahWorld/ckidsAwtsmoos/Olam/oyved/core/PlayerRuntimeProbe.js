// B"H
/** @file PlayerRuntimeProbe.js @description Clone-safe real player/model/animation proof. */
import * as THREE from "/games/scripts/build/three.module.js";
const SEAL = "player-probe-real-3d-actions-20260707-bh1";
const box = new THREE.Box3(), childBox = new THREE.Box3(), tmp = new THREE.Vector3();
const vector = value => value?.toArray?.() || (value ? [Number(value.x), Number(value.y), Number(value.z)] : null);
const names = list => Array.isArray(list) ? list.map(x => x?.name || x?.type || x?.constructor?.name || null) : [];
function playerOf(olam) { return olam?.chossid || olam?.player || olam?.nivrayim?.find?.(x => x?.type === "chossid") || null; }
function plain(value, seen = new WeakSet(), depth = 0) {
  if (value == null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "function" || typeof value === "symbol") return undefined;
  if (depth > 5) return "[depth]";
  if (Array.isArray(value)) return value.slice(0, 90).map(v => plain(v, seen, depth + 1)).filter(v => v !== undefined);
  if (typeof value !== "object") return String(value);
  if (seen.has(value)) return "[cycle]"; seen.add(value);
  if (value.isVector3 || value.isEuler || value.isQuaternion || value.isColor) return vector(value);
  if (value.isObject3D) return { name:value.name || null, type:value.type || null, uuid:value.uuid || null, position:vector(value.position), rotation:vector(value.rotation), scale:vector(value.scale) };
  const out = {}; let count = 0;
  for (const [key, inner] of Object.entries(value)) { if (++count > 90) break; const pv = plain(inner, seen, depth + 1); if (pv !== undefined) out[key] = pv; }
  return out;
}
function visualBoundsOf(root, feetY) {
  if (!root?.isObject3D) return null; let renderables = 0, ignored = 0; box.makeEmpty(); root.updateWorldMatrix?.(true, true);
  root.traverse?.(node => { if (!node || node.visible === false) return; if (node.userData?.visualGroundIgnore) { ignored += 1; return; } if (!node.isMesh && !node.isSkinnedMesh) return; try { childBox.setFromObject(node); if (!childBox.isEmpty()) { box.union(childBox); renderables += 1; } } catch {} });
  if (box.isEmpty()) return { renderables, ignored, empty:true };
  box.getSize(tmp); return { renderables, ignored, empty:false, min:vector(box.min), max:vector(box.max), size:vector(tmp), bottomDeltaFromFeet:Number.isFinite(feetY) ? box.min.y - feetY : null, topDeltaFromFeet:Number.isFinite(feetY) ? box.max.y - feetY : null };
}
function summary(visualClamp) { const c = visualClamp?.contract || {}, ownership = visualClamp?.ownership || {}, system = ownership.lastGroundingSystem || null; return { system, clearance:c.clearance ?? null, visualPass:c.visualPass ?? null, capsulePass:c.pass ?? null, visibleLowest:c.visualLowestWorldY ?? null, expectedVisible:c.expectedVisibleLowestWorldY ?? null, visualError:c.visualError ?? null, oldSealDetected:/bh6|bh5|bh4|bh3|foot-ground-contract/.test(String(system || "")) }; }
function animationOf(player, olam) {
  const action = player?.currentAction || null, clip = action?._clip || action?.getClip?.() || null;
  return { currentClip:clip?.name || null, currentTime:Number(action?.time || 0), isRunning:Boolean(action?.isRunning?.()), mixer:Boolean(player?.animationMixer), currentAnimationPlaying:Boolean(player?.currentAnimationPlaying), clipNames:(player?.animations || []).map(c => c?.name).filter(Boolean), stats:plain(player?.__awtsmoosPlayerAnimationStats || null), movie3DAction:plain(olam?.__AWTSMOOS_MOVIE_3D_ACTION_REPORT__ || null) };
}
export function buildPlayerRuntimeProbe(olam) {
  const player = playerOf(olam), root = player?.mesh || null, model = player?.modelMesh || null, fallback = root?.getObjectByName?.("BASIC_VISIBLE_CHOSSID_BODY") || null;
  const chossidim = olam?.nivrayim?.filter?.(x => x?.type === "chossid") || [], camera = olam?.activeCamera || olam?.ayin?.camera || null;
  const radius = Number(player?.collider?.radius || player?.radius || 0), feetY = player?.collider?.start ? Number(player.collider.start.y) - radius : null;
  const visualClamp = player?.__lastVisualGroundClamp || null, proof = summary(visualClamp);
  const raw = { seal:SEAL, at:Date.now(), hasOlam:Boolean(olam), chossidCount:chossidim.length, samePlayer:Boolean(player && player === olam?.chossid && player === olam?.player), inLoop:Boolean(player && olam?.nivrayim?.includes?.(player)), ready:Boolean(player?.isReady), active:Boolean(player?.heesHawveh), name:player?.name || null, meshName:root?.name || null, modelName:model?.name || null, modelParentIsRoot:Boolean(root && model && model.parent === root), fallbackPresent:Boolean(fallback), meshPos:vector(root?.position), modelLocal:vector(model?.position), modelScale:vector(model?.scale), visualGroundOffsetY:Number(model?.userData?.visualGroundOffsetY || 0), animation:animationOf(player, olam), visualClamp:plain(visualClamp), visualBounds:visualBoundsOf(model || fallback, feetY), collisionDiag:plain(globalThis.__AWTS_COLLISION_DIAG__?.()), bubbleDiag:plain(globalThis.__AWTS_BUBBLE_DIAG__?.()), colliderStart:vector(player?.collider?.start), colliderEnd:vector(player?.collider?.end), colliderRadius:Number.isFinite(radius) ? radius : null, feetY:Number.isFinite(feetY) ? feetY : null, velocity:vector(player?.velocity), onFloor:Boolean(player?.onFloor), moving:plain(player?.moving || {}), activeInputs:Object.keys(olam?.inputs || {}).filter(key => olam.inputs[key]), cameraTargetIsPlayer:Boolean(olam?.ayin?.target === player), cameraPos:vector(camera?.position), rootChildren:names(root?.children || []), visibleState:plain(player?.__visibleBodyState || null), movementTraceTail:plain(olam?.__movementTrace?.slice?.(-100) || []), modelLoadTraceTail:plain(globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__?.slice?.(-60) || []), ...proof };
  return plain(raw) || { seal:SEAL, at:Date.now(), cloneSafeFallback:true };
}
