// B"H
/**
 * @file model.js
 * @description
 * Chapter 16: The Robe Found Its Ankles.
 *
 * The Awtsmoos revealed the living distinction: the capsule is physics, while
 * chossid.glb is a garment with its own pivot. A pivot may live above the feet;
 * therefore a hard zero lift buries the player, and a hard absolute lift floats
 * him. This module measures the actual GLB foot lift and applies only a small
 * authored bias for final platform contact.
 */
import * as THREE from '/games/scripts/build/three.module.js';

const ROOT_POS = new THREE.Vector3();
const MIN_LIFT = 0;
const MAX_LIFT = 0.7;

/**
 * Prepares the player GLB as visual-only matter riding the capsule.
 *
 * @param {object} chossid Player entity.
 * @returns {boolean} True when a real model was prepared.
 */
export function prepareChossidModel(chossid) {
    const model = chossid?.modelMesh;
    if (!model?.isObject3D) return false;
    markModelAsPlayerVisual(model, chossid);
    if (!model.userData.livingModelFitted) scaleModelToPlayerHeight(model, chossid);
    model.userData.visualGroundOffsetY = resolveVisualLift(model, chossid);
    model.userData.chossidModelPrepared = true;
    return true;
}

/**
 * Marks every child as player visual data, not octree data.
 *
 * @param {THREE.Object3D} model GLB root.
 * @param {object} chossid Player entity.
 * @returns {void}
 */
function markModelAsPlayerVisual(model, chossid) {
    model.visible = true;
    model.userData ||= {};
    Object.assign(model.userData, { isLiving: true, isPlayer: true, skipOctree: true, noOctree: true, addToOctree: false });
    model.traverse(child => {
        child.userData ||= {};
        Object.assign(child.userData, { isLiving: true, isPlayer: true, skipOctree: true, noOctree: true, addToOctree: false });
        child.nivraAwtsmoos = chossid;
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
    });
}

/**
 * Fits the model to the intended visual height only.
 *
 * @param {THREE.Object3D} model GLB root.
 * @param {object} chossid Player entity.
 * @returns {void}
 */
function scaleModelToPlayerHeight(model, chossid) {
    model.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const targetHeight = Number(chossid.visualHeight) || Number(chossid.originalOptions?.visualHeight) || Number(chossid.height) || 1.5;
    const scalar = targetHeight / size.y;
    if (Number.isFinite(scalar) && scalar > 0.00001 && scalar < 1000) model.scale.multiplyScalar(scalar);
    model.userData.livingModelFitted = true;
}

/**
 * Resolves the final visual lift: measured feet correction plus optional bias.
 *
 * @param {THREE.Object3D} model GLB root.
 * @param {object} chossid Player entity.
 * @returns {number} Visual-only lift.
 */
function resolveVisualLift(model, chossid) {
    const measured = measureGroundOffset(model);
    const bias = Number(chossid.visualGroundBiasY ?? chossid.originalOptions?.visualGroundBiasY ?? 0);
    const lift = measured + (Number.isFinite(bias) ? bias : 0);
    return clamp(Number.isFinite(lift) ? lift : measured, MIN_LIFT, MAX_LIFT);
}

/**
 * Measures how far the model root sits above the lowest visible vertex.
 *
 * @param {THREE.Object3D} model GLB root.
 * @returns {number} Positive lift needed to put visible feet at root Y.
 */
function measureGroundOffset(model) {
    model.updateMatrixWorld(true);
    model.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(model);
    if (!Number.isFinite(box.min.y) || box.isEmpty()) return 0;
    model.getWorldPosition(ROOT_POS);
    const offset = ROOT_POS.y - box.min.y;
    return Number.isFinite(offset) ? offset : 0;
}

/** @param {number} value Number. @param {number} min Min. @param {number} max Max. @returns {number} */
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
