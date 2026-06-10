// B"H
/**
 * @file model.js
 * @description
 * Chapter 385: Visible Means Renderable.
 *
 * A `modelMesh` object is not enough. The Awtsmoos asks whether the garment has
 * a visible renderable mesh before trusting it. The GLB is scaled and aligned
 * when real; otherwise the fallback body is allowed to stand in the world.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { hasVisibleRenderable } from './fallbackBody.js?v=chossid-visible-guarantee-20260610-bh707';

const ROOT_POS = new THREE.Vector3();
const MAX_REASONABLE_OFFSET = 2.4;

/**
 * Prepares the real Chossid model if it actually has visible geometry.
 *
 * @param {object} chossid Player entity.
 * @returns {boolean} True when a real visible model was prepared.
 */
export function prepareChossidModel(chossid) {
  const model = chossid?.modelMesh;
  if (!model?.isObject3D) return false;
  markModelAsPlayerVisual(model, chossid);
  if (!hasVisibleRenderable(model)) return false;
  if (!model.userData.livingModelFitted) scaleModelToPlayerHeight(model, chossid);
  applyMeasuredFootOffset(model, chossid, 'initial');
  scheduleAfterFrameMeasurement(model, chossid);
  model.userData.chossidModelPrepared = true;
  return true;
}

/** @param {THREE.Object3D} model Model root. @param {object} chossid Player. */
function markModelAsPlayerVisual(model, chossid) {
  model.visible = true;
  Object.assign(model.userData ||= {}, { isLiving: true, isPlayer: true, skipOctree: true, noOctree: true, addToOctree: false });
  model.traverse(child => {
    Object.assign(child.userData ||= {}, { isLiving: true, isPlayer: true, skipOctree: true, noOctree: true, addToOctree: false });
    child.nivraAwtsmoos = chossid;
    if (!child.isMesh) return;
    child.visible = child.visible !== false;
    child.castShadow = true;
    child.receiveShadow = true;
    child.frustumCulled = false;
  });
}

/** @param {THREE.Object3D} model Model. @param {object} chossid Player. */
function scaleModelToPlayerHeight(model, chossid) {
  model.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const targetHeight = Number(chossid.visualHeight) || Number(chossid.originalOptions?.visualHeight) || Number(chossid.height) || 1.5;
  const scalar = targetHeight / size.y;
  if (Number.isFinite(scalar) && scalar > 0.00001 && scalar < 1000) model.scale.multiplyScalar(scalar);
  model.userData.livingModelFitted = true;
}

/** @param {THREE.Object3D} model Model. @param {object} chossid Player. */
function scheduleAfterFrameMeasurement(model, chossid) {
  if (model.userData.afterFrameFootMeasurementQueued) return;
  model.userData.afterFrameFootMeasurementQueued = true;
  const raf = globalThis.requestAnimationFrame || (cb => setTimeout(cb, 16));
  raf(() => raf(() => applyMeasuredFootOffset(model, chossid, 'after-two-frames')));
}

/** @param {THREE.Object3D} model Model. @param {object} chossid Player. @param {string} phase Phase. */
function applyMeasuredFootOffset(model, chossid, phase) {
  const measured = measureRootToLowestVisiblePoint(model);
  const offset = sanitizeOffset(measured);
  model.userData.visualGroundOffsetY = offset;
  model.userData.visualFootMeasurement = { phase, measured, applied: offset, at: Date.now() };
  chossid.visualGroundBiasY = 0;
  chossid.visualYOffset = offset;
  alignModelToColliderFeet(model, chossid);
}

/** @param {THREE.Object3D} model Model. @returns {number} Root-to-lowest offset. */
function measureRootToLowestVisiblePoint(model) {
  model.updateMatrixWorld(true);
  model.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(model);
  if (!Number.isFinite(box.min.y) || box.isEmpty()) return 0;
  model.getWorldPosition(ROOT_POS);
  const offset = ROOT_POS.y - box.min.y;
  return Number.isFinite(offset) ? offset : 0;
}

/** @param {number} value Raw offset. @returns {number} Safe offset. */
function sanitizeOffset(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(MAX_REASONABLE_OFFSET, value));
}

/** @param {THREE.Object3D} model Model. @param {object} chossid Player. */
function alignModelToColliderFeet(model, chossid) {
  const collider = chossid?.collider;
  if (!collider?.start) return;
  const radius = Number(collider.radius || chossid.radius || 0.45);
  const feetY = collider.start.y - radius;
  model.position.set(collider.start.x, feetY + Number(model.userData.visualGroundOffsetY || 0), collider.start.z);
}
