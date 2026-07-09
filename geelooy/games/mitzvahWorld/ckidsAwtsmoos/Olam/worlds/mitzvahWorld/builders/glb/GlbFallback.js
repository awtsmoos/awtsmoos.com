/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE FALLBACK OF MERCY — GlbFallback.js
 *   ──────────────────────────────────────────
 *   "Even in the darkest concealment, G-d is present."
 *   When the binary vessel fails to load, we do not leave the
 *   world empty. We provide a fallback, a placeholder of magenta light,
 *   so that the structure remains intact.
 *
 *   This is the attribute of Chessed in the face of technical Gevurah.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module GlbFallback
 */

import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

/**
 * @function makeFallbackCapsule
 * @description
 *   Creates a magenta capsule to mark where the entity should have been.
 *   Ensures the world doesn't collapse just because a file is missing.
 *
 * @returns {THREE.Mesh}
 */
export function makeFallbackCapsule() {
  const geo  = THREE.CapsuleGeometry
    ? new THREE.CapsuleGeometry(0.4, 1.6, 8, 16)
    : new THREE.CylinderGeometry(0.4, 0.4, 1.6, 16);
    
  const mat  = new THREE.MeshLambertMaterial({ color: 0xff00ff });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.isFallback = true;
  return mesh;
}

export default makeFallbackCapsule;
