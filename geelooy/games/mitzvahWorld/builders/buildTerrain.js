/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE GROUND OF ALL GROUNDS — buildTerrain.js
 *   ─────────────────────────────────────────────
 *   "In the beginning G-d created the heavens and THE EARTH."
 *   Without the ground, where would the Chassid stand?
 *
 *   TIKKUN: Changed `from 'three'` to the absolute path used by all
 *   other worker-context files. Bare specifiers ('three') are resolved
 *   by Vite's transform pipeline — but not inside blob: URL or Worker
 *   contexts that fall outside that pipeline.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module buildTerrain
 */

import * as THREE from '/games/scripts/build/three.module.js';

/**
 * @function buildTerrain
 * @description
 *   Conjures the great flat earth from void and color.
 *   A PlaneGeometry rotated flat, a static physics box so nobody falls through.
 *
 * @param   {THREE.Scene}   scene   - The living scene
 * @param   {Object|null}   physics - Physics world
 * @param   {import('../nivrayimDefs.js').NefeshDef} def - Soul blueprint
 * @returns {Promise<THREE.Mesh[]>}
 */
export async function buildTerrain(scene, physics, def) {
  const { width = 200, depth = 200, color = 0x7ec850, receiveShadow = true } = def.props || {};
  const [px, py, pz] = def.position || [0, 0, 0];

  const geo = new THREE.PlaneGeometry(width, depth, 1, 1);
  geo.rotateX(-Math.PI / 2);

  const mat  = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(px, py, pz);
  mesh.receiveShadow = receiveShadow;
  mesh.name = def.id;

  if (physics && def.props?.physics) {
    const [hx, hy, hz] = def.props.physics.halfExtents || [width / 2, 0.5, depth / 2];
    _addStaticBox(physics, px, py - hy, pz, hx, hy, hz);
  }

  return [mesh];
}

/**
 * @function _addStaticBox
 * @description Duck-typed static box registration for Rapier or custom APIs.
 * @param {Object} physics
 * @param {number} x @param {number} y @param {number} z
 * @param {number} hx @param {number} hy @param {number} hz
 * @returns {void}
 */
function _addStaticBox(physics, x, y, z, hx, hy, hz) {
  try {
    if (typeof physics.addStaticBox === 'function') {
      physics.addStaticBox({ x, y, z }, { hx, hy, hz });
    } else if (physics.world && typeof physics.world.createRigidBody === 'function') {
      const RAPIER    = physics.RAPIER;
      const bodyDesc  = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
      const body      = physics.world.createRigidBody(bodyDesc);
      physics.world.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz), body);
    } else {
      console.warn(`B"H - buildTerrain: physics API not recognized, skipping collider.`);
    }
  } catch (e) {
    console.error(`B"H - buildTerrain: physics error →`, e);
  }
}