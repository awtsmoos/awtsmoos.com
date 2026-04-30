
/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE GARDEN OF PROLIFERATING LIGHT — buildGrassPatch.js
 *   ────────────────────────────────────────────────────────
 *   "Let the earth sprout vegetation, seed-bearing plants..." —
 *   Bereishis 1:11, the Third Day, the Day of Double Blessing.
 *
 *   Grass is the Netzach — victory, eternity, the endless
 *   proliferation of Divine kindness into every blade,
 *   every chlorophyll molecule, every sway in the breeze.
 *
 *   We use InstancedMesh for maximum holiness per draw call.
 *   One mesh. Many instances. Like the one G-d with infinite worlds.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module buildGrassPatch
 */

import * as THREE from 'three';

/** @constant {THREE.Object3D} _DUMMY - Reusable transform scratch object */
const _DUMMY = new THREE.Object3D();

/**
 * @function buildGrassPatch
 * @description
 *   Scatters `count` grass blades within `radius` of [px, py, pz]
 *   using InstancedMesh — a single GPU draw call for all blades.
 *
 *   Each blade: a thin BoxGeometry, randomly scaled in height (0.2–0.5),
 *   randomly rotated in Y, randomly offset in XZ within the radius.
 *
 *   "He makes grass grow for the cattle" — and for the GPU too,
 *   efficiently, gloriously, in a single instanced whisper.
 *
 * @param   {THREE.Scene}   scene   - The living scene (unused here; factory adds it)
 * @param   {Object|null}   physics - Physics world (grass needs no physics)
 * @param   {import('../nivrayimDefs.js').NefeshDef} def - Soul blueprint
 * @returns {Promise<THREE.InstancedMesh[]>} Single-element array with the instanced mesh
 */
export async function buildGrassPatch(scene, physics, def) {
  const {
    radius = 80,
    count  = 120,
    color  = 0x5cb85c,
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];

  const geo = new THREE.BoxGeometry(0.08, 1, 0.08);
  const mat = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow = false;
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
