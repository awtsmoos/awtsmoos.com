// B"H
/**
 * @file fallbackBody.js
 * @description
 * Chapter 5: The Emergency Body Stayed Behind The Curtain.
 *
 * This fallback appears only if the real GLB cannot be prepared. It never
 * replaces chossid.glb when the model exists.
 */
import * as THREE from '/games/scripts/build/three.module.js';

/**
 * Ensures a simple visible body exists only when no GLB is available.
 *
 * @param {object} chossid Player entity.
 * @returns {void}
 */
export function ensureFallbackBody(chossid) {
    if (!chossid?.mesh?.isObject3D) return;
    const existing = chossid.mesh.getObjectByName?.('BASIC_VISIBLE_CHOSSID_BODY');
    if (chossid.modelMesh?.isObject3D) {
        existing?.removeFromParent?.();
        return;
    }
    if (existing) {
        existing.visible = true;
        return;
    }
    chossid.mesh.add(buildFallbackBody(chossid));
}

/**
 * Builds the small emergency body.
 *
 * @param {object} chossid Player entity.
 * @returns {THREE.Group} Fallback visible body.
 */
function buildFallbackBody(chossid) {
    const body = new THREE.Group();
    body.name = 'BASIC_VISIBLE_CHOSSID_BODY';
    body.add(
        mesh('BASIC_VISIBLE_CHOSSID_ROBE', new THREE.BoxGeometry(0.85, 1.45, 0.55), 0x1f6fff, 0.8),
        mesh('BASIC_VISIBLE_CHOSSID_HEAD', new THREE.BoxGeometry(0.45, 0.45, 0.45), 0xf1d0a8, 1.75),
        mesh('BASIC_VISIBLE_CHOSSID_HAT', new THREE.BoxGeometry(0.65, 0.22, 0.65), 0x111111, 2.08)
    );
    body.userData.isLiving = true;
    body.userData.isPlayerFallback = true;
    body.traverse(child => {
        child.userData.isLiving = true;
        child.frustumCulled = false;
        child.nivraAwtsmoos = chossid;
    });
    return body;
}

/**
 * Creates one fallback mesh part.
 *
 * @param {string} name Mesh name.
 * @param {THREE.BufferGeometry} geometry Geometry.
 * @param {number} color Material color.
 * @param {number} y Local Y position.
 * @returns {THREE.Mesh} Mesh part.
 */
function mesh(name, geometry, color, y) {
    const part = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color }));
    part.name = name;
    part.position.y = y;
    part.castShadow = true;
    part.receiveShadow = true;
    return part;
}
