// B"H
/** Chossid model prep: bind visible GLB, foot offset, and live animation mixer. */
import * as THREE from '/games/scripts/build/three.module.js';
import { hasVisibleRenderable } from './fallbackBody.js?v=chossid-visible-guarantee-20260610-bh707';
import { sanitizeLivingModelTree } from '../../../../Olam/worlds/mitzvahWorld/npcs/LivingModelSanitizer.js';

const ROOT_POS = new THREE.Vector3();
const MAX_REASONABLE_OFFSET = 2.4;
const START_CLIPS = ["stand", "neutral", "idle", "walk"];

export function prepareChossidModel(chossid) {
  const model = chossid?.modelMesh; if (!model?.isObject3D) return false;
  markModelAsPlayerVisual(model, chossid); if (!hasVisibleRenderable(model)) return false;
  if (!model.userData.livingModelFitted) scaleModelToPlayerHeight(model, chossid);
  applyMeasuredFootOffset(model, chossid, 'initial'); scheduleAfterFrameMeasurement(model, chossid);
  ensureChossidAnimationRuntime(chossid, model); model.userData.chossidModelPrepared = true; return true;
}
function markModelAsPlayerVisual(model, chossid) {
  model.visible = true; sanitizeLivingModelTree(model, { isPlayer:true });
  Object.assign(model.userData ||= {}, { isLiving:true, isPlayer:true, skipOctree:true, noOctree:true, addToOctree:false });
  model.traverse(child => { Object.assign(child.userData ||= {}, { isLiving:true, isPlayer:true, skipOctree:true, noOctree:true, addToOctree:false }); child.nivraAwtsmoos = chossid; if (!child.isMesh && !child.isSkinnedMesh) return; child.visible = child.visible !== false; child.castShadow = true; child.receiveShadow = true; child.frustumCulled = false; });
}
function scaleModelToPlayerHeight(model, chossid) {
  model.updateWorldMatrix(true, true); const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3());
  const targetHeight = Number(chossid.visualHeight) || Number(chossid.originalOptions?.visualHeight) || Number(chossid.height) || 1.5;
  const scalar = targetHeight / size.y; if (Number.isFinite(scalar) && scalar > 0.00001 && scalar < 1000) model.scale.multiplyScalar(scalar);
  model.userData.livingModelFitted = true;
}
function scheduleAfterFrameMeasurement(model, chossid) {
  if (model.userData.afterFrameFootMeasurementQueued) return; model.userData.afterFrameFootMeasurementQueued = true;
  const raf = globalThis.requestAnimationFrame || (cb => setTimeout(cb, 16)); raf(() => raf(() => applyMeasuredFootOffset(model, chossid, 'after-two-frames')));
}
function applyMeasuredFootOffset(model, chossid, phase) {
  const measured = measureRootToLowestVisiblePoint(model), offset = sanitizeOffset(measured);
  model.userData.visualGroundOffsetY = offset; model.userData.visualFootMeasurement = { phase, measured, applied:offset, rootBound:model.parent === chossid?.mesh, at:Date.now() };
  chossid.visualGroundBiasY = 0; chossid.visualYOffset = offset; alignModelToColliderFeet(model, chossid);
}
function measureRootToLowestVisiblePoint(model) {
  model.updateMatrixWorld(true); model.updateWorldMatrix(true, true); const box = new THREE.Box3().setFromObject(model);
  if (!Number.isFinite(box.min.y) || box.isEmpty()) return 0; model.getWorldPosition(ROOT_POS); const offset = ROOT_POS.y - box.min.y; return Number.isFinite(offset) ? offset : 0;
}
function sanitizeOffset(value) { return Number.isFinite(value) ? Math.max(0, Math.min(MAX_REASONABLE_OFFSET, value)) : 0; }
function alignModelToColliderFeet(model, chossid) {
  const collider = chossid?.collider; if (!collider?.start) return; const offsetY = Number(model.userData.visualGroundOffsetY || 0);
  if (model.parent === chossid?.mesh) { model.position.set(0, offsetY, 0); model.rotation.y = Number(chossid.rotateOffset || 0); model.updateMatrixWorld(true); return; }
  const radius = Number(collider.radius || chossid.radius || 0.45), feetY = collider.start.y - radius; model.position.set(collider.start.x, feetY + offsetY, collider.start.z);
}
function clipNames(chossid) { return (chossid?.animations || []).map(clip => String(clip?.name || "")); }
function hasStartClip(name) { const lower = String(name || "").toLowerCase(); return START_CLIPS.some(key => lower.includes(key)); }
function ensureChossidAnimationRuntime(chossid, model) {
  if (!chossid) return false; if (!chossid.animationMixer && chossid.animations?.length) chossid.animationMixer = new THREE.AnimationMixer(model);
  if (chossid.animationMixer) chossid.animationMixer.timeScale = Number(chossid.animationSpeedScale || 1);
  const names = clipNames(chossid); model.userData.chossidAnimationRuntime = { clipCount:names.length, clipNames:names, mixerReady:Boolean(chossid.animationMixer), selfStarted:false, seal:"chossid-glb-animation-bound-20260707-bh1" };
  if (!chossid.currentAction && names.length && typeof chossid.playChaweeyoos === "function") { const chosen = names.find(hasStartClip) ? "stand" : names[0]; chossid.playChaweeyoos(chosen, { force:true, duration:.035 }); model.userData.chossidAnimationRuntime.selfStarted = Boolean(chossid.currentAction); model.userData.chossidAnimationRuntime.chosen = chosen; }
  chossid.__chossidGlbAnimationRuntime = model.userData.chossidAnimationRuntime; return Boolean(chossid.animationMixer && names.length);
}
