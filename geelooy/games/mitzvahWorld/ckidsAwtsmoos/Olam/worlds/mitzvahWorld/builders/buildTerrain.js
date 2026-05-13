
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

import * as THREE from '/games/scripts/build/three.module.js';
import { createGroundMixMaterial } from './shaders/GroundMixShader.js';

/**
 * @function buildTerrain
 * @description
 *   Conjures the great flat earth from void and color.
 *   Now uses a complex Mix Shader to blend Dirt and Grass,
 *   manifesting the dual nature of Malchus (reception and growth).
 *
 *   Physics: a static BoxCollider flush with y=0.
 *   Octree: The mesh is added to the worldOctree to provide the 
 *   physical grounding for all character controllers.
 *
 * @param   {THREE.Scene}   scene   - The living scene
 * @param   {Object|null}   physics - Physics world
 * @param   {import('../nivrayimDefs.js').NefeshDef} def - Soul blueprint
 * @param   {Object|null}   olam    - Olam context for octree insertion
 * @returns {Promise<THREE.Mesh[]>}  Array containing the single terrain mesh
 */
export async function buildTerrain(scene, physics, def, olam = null) {
  const { width = 200, depth = 200, receiveShadow = true } = def.props || {};
  const [px, py, pz] = def.position || [0, 0, 0];

  // ── Geometry & Shader Material ─────────────────────────────────────────
  const geo = new THREE.PlaneGeometry(width, depth, 32, 32); // Higher density for shader detail
  geo.rotateX(-Math.PI / 2);

  const mat = createGroundMixMaterial({
    dirtColor:  new THREE.Color(def.props?.dirtColor || 0x5d4037),
    grassColor: new THREE.Color(def.props?.grassColor || 0x2e7d32),
    scale:      def.props?.shaderScale || 0.05
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(px, py, pz);
  mesh.receiveShadow = receiveShadow;
  mesh.name = def.id;

  // ── Octree (The True Grounding) ───────────────────────────────────────
  // B"H: Mark as solid reality for the unified NivrahFactory registration
  mesh.userData.isSolid = true;

  // ── Physics (static ground box for external physics engines) ──────────
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
