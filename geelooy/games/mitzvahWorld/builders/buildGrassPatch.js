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
 *   TIKKUN: randomness now flows through a seeded vessel instead of the hidden
 *   storm, so the same grass patch can replay its every blade.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module buildGrassPatch
 */

import * as THREE from '/games/scripts/build/three.module.js';

/** @constant {THREE.Object3D} _DUMMY - Reusable transform scratch object */
const _DUMMY = new THREE.Object3D();

/**
 * B"H
 * A tiny deterministic pulse. The Awtsmoos gives each blade a revealed order:
 * no silent dice, no wandering shadow, only seed becoming geometry.
 * @param {number|string|undefined} seed
 * @returns {() => number} a number generator in [0, 1)
 */
function createGrassRng(seed = 777) {
  let state = Array.from(String(seed)).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

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
    seed   = def.id || 777,
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const rng = createGrassRng(seed);

  const geo  = new THREE.BoxGeometry(0.08, 1, 0.08);
  const mat  = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow    = false;
  mesh.receiveShadow = true;
  mesh.name = def.id;

  for (let i = 0; i < count; i++) {
    const angle  = rng() * Math.PI * 2;
    const dist   = Math.sqrt(rng()) * radius;
    const bladeH = 0.2 + rng() * 0.3;

    _DUMMY.position.set(
      px + Math.cos(angle) * dist,
      py + bladeH / 2,
      pz + Math.sin(angle) * dist,
    );
    _DUMMY.rotation.y = rng() * Math.PI * 2;
    _DUMMY.scale.set(1, bladeH * 2, 1);
    _DUMMY.updateMatrix();
    mesh.setMatrixAt(i, _DUMMY.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  return [mesh];
}
