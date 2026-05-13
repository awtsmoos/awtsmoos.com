/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE STRENGTH OF THE VESSEL — GlbPhysics.js
 *   ──────────────────────────────────────────
 *   "Gevurah" — Strength and Constraint.
 *   The physics body is the boundary that allows the entity to 
 *   interact with the world without passing through it like a ghost.
 *   It provides the resistance necessary for physical existence.
 *
 *   This module handles the manifestation of the dynamic capsule
 *   collider, ensuring the Chossid stands firm upon the ground.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module GlbPhysics
 */

/**
 * @function addDynamicCapsule
 * @description
 *   Adds a dynamic capsule collider for the GLB entity.
 *   Supports Rapier and custom physics APIs.
 *
 * @param {Object} physics - The physics world instance
 * @param {number} x @param {number} y @param {number} z - Position
 * @param {Object} physDef - Physics parameters (radius, height, mass)
 * @returns {void}
 */
export function addDynamicCapsule(physics, x, y, z, physDef) {
  const { radius = 0.4, height = 1.6, mass = 70 } = physDef;
  try {
    if (typeof physics.addDynamicCapsule === 'function') {
      physics.addDynamicCapsule({ x, y, z }, radius, height, mass);
    } else if (physics.world?.createRigidBody) {
      const R    = physics.RAPIER;
      const desc = R.RigidBodyDesc.dynamic().setTranslation(x, y + height / 2, z);
      const body = physics.world.createRigidBody(desc);
      physics.world.createCollider(R.ColliderDesc.capsule(height / 2, radius), body);
    }
  } catch (e) {
    console.error('B"H - GlbPhysics error:', e);
  }
}

export default addDynamicCapsule;
