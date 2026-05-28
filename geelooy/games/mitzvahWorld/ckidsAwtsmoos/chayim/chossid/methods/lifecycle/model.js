// B"H
/**
 * @file model.js
 * @description
 * Chapter 4: The GLB Stood On The Capsule.
 *
 * The visible chossid.glb is not physics. It is prepared as a living visual
 * garment, measured, scaled, and given a foot offset so the collider can remain
 * small and trustworthy while the model stands correctly above it.
 */
import * as THREE from '/games/scripts/build/three.module.js';

/**
 * Prepares the player GLB as a visual overlay.
 *
 * @param {object} chossid Player entity.
 * @returns {boolean} True when a real model was prepared.
 */
export function prepareChossidModel(chossid) {
    const model = chossid?.modelMesh;
    if (!model?.isObject3D) return false;
    markModelAsPlayerVisual(model, chossid);
    if (model.userData.chossidModelPrepared) return true;
    if (!model.userData.livingModelFitted) {
        scaleModelToPlayerHeight(model, chossid);
        model.userData.visualGroundOffsetY = measureGroundOffset(model);
    } else if (!Number.isFinite(model.userData.visualGroundOffsetY)) {
        model.userData.visualGroundOffsetY = measureGroundOffset(model);
    }
    model.userData.chossidModelPrepared = true;
    return true;
}

/**
 * Marks every child as living player visual data.
 *
 * @param {THREE.Object3D} model GLB root.
 * @param {object} chossid Player entity.
 * @returns {void}
 */
function markModelAsPlayerVisual(model, chossid) {
    model.visible = true;
    model.userData ||= {};
    Object.assign(model.userData, { isLiving: true, isPlayer: true, skipOctree: true, noOctree: true });
    model.traverse(child => {
        child.userData ||= {};
        Object.assign(child.userData, { isLiving: true, isPlayer: true, skipOctree: true, noOctree: true });
        child.nivraAwtsmoos = chossid;
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
    });
}

/**
 * Fits the model to the intended player visual height.
 *
 * @param {THREE.Object3D} model GLB root.
 * @param {object} chossid Player entity.
 * @returns {void}
 */
function scaleModelToPlayerHeight(model, chossid) {
    model.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const targetHeight = Number(chossid.visualHeight) ||
        Number(chossid.originalOptions?.visualHeight) ||
        Number(chossid.height) ||
        1.85;
    const scalar = targetHeight / size.y;
    if (Number.isFinite(scalar) && scalar > 0.00001 && scalar < 1000) {
        model.scale.multiplyScalar(scalar);
    }
}

/**
 * Measures how far the model root is above its lowest visible point.
 *
 * @param {THREE.Object3D} model GLB root.
 * @returns {number} Y offset needed to put feet on the collider base.
 */
function measureGroundOffset(model) {
    model.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(model);
    const rootY = model.getWorldPosition(new THREE.Vector3()).y;
    const offset = rootY - box.min.y;
    return Number.isFinite(offset) ? offset : 0;
}
