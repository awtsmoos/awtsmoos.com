// B"H
import { PhysicsState } from '../../renderer/character/realism/PhysicsState.js';
import { WorldPhysics } from '../../../engine/reality/physics/WorldPhysics.js';

/**
 * @file PhysicsSystem.js
 * @description
 * Chapter: One law for gravity, wind, hair, cloth, and cinematic weight.
 * The duplicate physics paths now converge here. Characters remain grounded,
 * secondary motion receives ruach, and walking bodies get subtle film inertia
 * without corrupting authored positions.
 */
export class PhysicsSystem {
  /**
   * Applies physical secondary motion.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Render time.
   * @param {number} dt - Delta time.
   * @param {number} groundY - Ground y.
   * @returns {Object|undefined} Mutated data.
   */
  static process(data, time = 0, dt = 16, groundY = 120) {
    if (!data?.position) return undefined;
    this.ground(data, dt, groundY);
    this.secondary(data, time);
    return data;
  }

  /** @param {Object} data @param {number} dt @param {number} groundY @returns {void} */
  static ground(data, dt, groundY) {
    data.velocity = data.velocity || { x: 0, y: 0 };
    const scale = Math.max(0.25, Math.min(2, Number(dt || 16) / 16));

    if (data.position.y < groundY && data.motionMode !== 'worldTravel') {
      data.velocity.y += 0.45 * scale;
      data.position.y += data.velocity.y * scale;
    }

    if (data.position.y >= groundY) {
      data.position.y = groundY;
      data.velocity.y = 0;
      data.isGrounded = true;
    } else {
      data.isGrounded = data.motionMode === 'worldTravel';
    }
  }

  /** @param {Object} data @param {number} time @returns {void} */
  static secondary(data, time) {
    const id = data.id || data.name || 'character';
    const wind = WorldPhysics.getWindForce(data.position.x, time);
    const gait = data.motionMode === 'worldTravel' ? Math.sin(Number(data._travelProgress || 0) * Math.PI * 2) : 0;
    data.physics = data.physics || {};

    const hair = PhysicsState.get(id, 'hair', 3, 20);
    hair.points.forEach((p, i) => {
      if (i > 0) p.x += wind * (0.08 + i * 0.025) + gait * 0.18;
    });
    hair.update(data.position.x, data.position.y - 250);
    data.physics.hair = hair.points;

    const clothLeft = PhysicsState.get(id, 'cloth_l', 4, 25);
    clothLeft.points.forEach((p, i) => {
      if (i > 0) p.x += wind * 0.14 - gait * 0.45;
    });
    clothLeft.update(data.position.x - 30, data.position.y - 140);
    data.physics.clothLeft = clothLeft.points;

    const clothRight = PhysicsState.get(id, 'cloth_r', 4, 25);
    clothRight.points.forEach((p, i) => {
      if (i > 0) p.x += wind * 0.14 + gait * 0.45;
    });
    clothRight.update(data.position.x + 30, data.position.y - 140);
    data.physics.clothRight = clothRight.points;
  }
}
