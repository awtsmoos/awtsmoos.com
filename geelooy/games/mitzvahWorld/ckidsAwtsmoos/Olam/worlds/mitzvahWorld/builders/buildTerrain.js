
/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE GROUND OF ALL GROUNDS — buildTerrain.js
 *   ─────────────────────────────────────────────
 *   "In the beginning G-d created the heavens and THE EARTH."
 *   The earth came second in the verse, but first in our hearts —
 *   for without the ground, where would the Chassid stand?
 *   Where would the grass grow? Where would the bricks be laid?
 *
 *   This builder manifests the Malchus — the Kingdom —
 *   the great receiving vessel that catches all the light from above
 *   and turns it into something you can actually walk on.
 *
 *   Physics: a static BoxCollider flush with y=0,
 *   so gravity never swallows our holy traveler whole.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module buildTerrain
 */

import * as THREE from 'three';

/**
 * @function buildTerrain
 * @description
 *   Conjures the great flat earth from void and color.
 *   A PlaneGeometry rotated to lie flat, an infinite green mercy,
 *   a static physics box so nobody falls through to the Kelipot below.
 *
 *   "The earth is the Lord's and the fullness thereof" —
 *   even this polygon plane, tiled with green, belongs to Him.
 *
 * @param   {THREE.Scene}   scene   - The living scene
 * @param   {Object|null}   physics - Physics world (Rapier/Cannon/custom)
 * @param   {import('../nivrayimDefs.js').NefeshDef} def - Soul blueprint
 * @returns {Promise<THREE.Mesh[]>}  Array containing the single terrain mesh
 */
export async function buildTerrain(scene, physics, def) {
  const { width = 200, depth = 200, color = 0x7ec850, receiveShadow = true } = def.props || {};
  const [px, py, pz] = def.position || [0, 0, 0];

  // ── Geometry & Material ──────────────────────────────────────────────
  const geo = new THREE.PlaneGeometry(width, depth, 1, 1);
  geo.rotateX(-Math.PI / 2);

  const mat = new THREE.MeshLambertMaterial({ color });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(px, py, pz);
  mesh.receiveShadow = receiveShadow;
  mesh.name = def.id;

  // ── Physics (static ground box) ──────────────────────────────────────
  if (physics && def.props?.physics) {
    const [hx, hy, hz] = def.props.physics.halfExtents || [width / 2, 0.5, depth / 2];
    _addStaticBox(physics, px, py - hy, pz, hx, hy, hz);
  }

  return [mesh];
}

/**
 * @function _addStaticBox
 * @description
 *   Internal helper: registers a static AABB with whatever physics
 *   world is present. Gracefully handles Rapier, Cannon, or a custom
 *   addStaticBox() API by duck-typing.
 *
 *   "The strength of Gevurah holds the world from collapsing inward" —
 *   so too does this box hold the ground from becoming a void.
 *
 * @param   {Object} physics - Physics world instance
 * @param   {number} x       - Center X
 * @param   {number} y       - Center Y
 * @param   {number} z       - Center Z
 * @param   {number} hx      - Half-extent X
 * @param   {number} hy      - Half-extent Y
 * @param   {number} hz      - Half-extent Z
 * @returns {void}
 */
function _addStaticBox(physics, x, y, z, hx, hy, hz) {
  try {
    if (typeof physics.addStaticBox === 'function') {
      physics.addStaticBox({ x, y, z }, { hx, hy, hz });
    } else if (physics.world && typeof physics.world.createRigidBody === 'function') {
      // Rapier path
      const RAPIER = physics.RAPIER;
      const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
      const body = physics.world.createRigidBody(bodyDesc);
      const colliderDesc = RAPIER.ColliderDesc.cuboid(hx, hy, hz);
      physics.world.createCollider(colliderDesc, body);
    } else {
      console.warn(`B"H - buildTerrain: physics API not recognized, skipping collider for terrain.`);
    }
  } catch (e) {
    console.error(`B"H - buildTerrain: physics error →`, e);
  }
}
