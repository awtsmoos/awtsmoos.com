/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE GARDEN OF PROLIFERATING LIGHT — buildGrassPatch.js
 *   ────────────────────────────────────────────────────────
 *   "Let the earth sprout vegetation..." — Bereishis 1:11
 *   One InstancedMesh. Infinite blades. Like the one G-d with infinite worlds.
 *
 *   TIKKUN: `from 'three'` → absolute path (blob:/Worker-safe).
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module buildGrassPatch
 */

import * as THREE from '/games/scripts/build/three.module.js';

/** @constant {THREE.Object3D} _DUMMY - Reusable transform scratch object */
const _DUMMY = new THREE.Object3D();

/**
 * @function buildGrassPatch
 * @description
 *   Scatters `count` grass blades within `radius` using InstancedMesh.
 *   One GPU draw call for all blades — maximum holiness per draw.
 *
 * @param   {THREE.Scene}   scene
 * @param   {Object|null}   physics
 * @param   {import('../nivrayimDefs.js').NefeshDef} def
 * @returns {Promise<THREE.InstancedMesh[]>}
 */
export async function buildGrassPatch(scene, physics, def) {
  const {
    radius = 80,
    count  = 120,
    color  = 0x5cb85c,
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];

  const geo  = new THREE.BoxGeometry(0.08, 1, 0.08);
  const mat  = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow    = false;
  mesh.receiveShadow = true;
  mesh.name = def.id;

  for (let i = 0; i < count; i++) {
    const angle  = Math.random() * Math.PI * 2;
    const dist   = Math.sqrt(Math.random()) * radius;
    const bladeH = 0.2 + Math.random() * 0.3;

    _DUMMY.position.set(
      px + Math.cos(angle) * dist,
      py + bladeH / 2,
      pz + Math.sin(angle) * dist,
    );
    _DUMMY.rotation.y = Math.random() * Math.PI * 2;
    _DUMMY.scale.set(1, bladeH * 2, 1);
    _DUMMY.updateMatrix();
    mesh.setMatrixAt(i, _DUMMY.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  return [mesh];
}