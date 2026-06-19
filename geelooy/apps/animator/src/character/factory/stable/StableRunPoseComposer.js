// B"H

/**
 * @file StableRunPoseComposer.js
 * @description
 * ============================================================================
 * CHAPTER: THE RUN WITH AIR BETWEEN THE STEPS
 * ============================================================================
 *
 * Running is not faster walking. It has stronger stride, higher knee, bigger
 * arm pump, more lean, and an airborne moment. It also returns a full-body pose
 * so left and right remain relationally locked.
 *
 * @class StableRunPoseComposer
 */
export class StableRunPoseComposer {
  /**
   * Samples a complete run pose.
   *
   * @param {number} time - Render time.
   * @param {number} dir - Facing direction.
   * @returns {Object} Complete pose.
   */
  static sample(time = 0, dir = 1) {
    const seconds = (Number.isFinite(time) ? time : 0) / 1000;
    const cycle = seconds * 2.35;
    const whole = Math.floor(cycle);
    const phase = cycle - whole;
    const rightDriving = whole % 2 === 0;
    const driveSide = rightDriving ? 1 : -1;
    const trailSide = -driveSide;
    const p = this.phasePose(phase);

    return {
      action: 'run',
      phase,
      phaseName: p.phaseName,
      body: {
        bob: p.bodyBob,
        torsoLean: p.torsoLean * dir,
        headNod: p.headNod
      },
      legs: {
        left: this.legForSide(-1, driveSide, trailSide, p),
        right: this.legForSide(1, driveSide, trailSide, p)
      },
      arms: {
        left: this.armForSide(-1, driveSide, trailSide, p),
        right: this.armForSide(1, driveSide, trailSide, p)
      }
    };
  }

  /**
   * Returns run phase.
   *
   * @param {number} phase - Phase.
   * @returns {Object} Phase pose.
   */
  static phasePose(phase) {
    if (phase < 0.28) {
      const t = this.smooth(phase / 0.28);
      return {
        phaseName: 'drive',
        drive: this.mix({ footX: 26, kneeX: 15, ankleX: 23, kneeY: -2, ankleY: 0, footY: 0, footTilt: -0.1 }, { footX: 5, kneeX: 10, ankleX: 6, kneeY: 8, ankleY: -1, footY: 0, footTilt: 0.02 }, t),
        trail: this.mix({ footX: -28, kneeX: -18, ankleX: -25, kneeY: -4, ankleY: -5, footY: -3, footTilt: 0.18 }, { footX: -8, kneeX: -3, ankleX: -7, kneeY: -19, ankleY: -20, footY: -12, footTilt: 0.28 }, t),
        bodyBob: this.lerp(-1, -7, t),
        torsoLean: this.lerp(2.5, 4, t),
        headNod: this.lerp(0, 1, t)
      };
    }

    if (phase < 0.58) {
      const t = this.smooth((phase - 0.28) / 0.3);
      return {
        phaseName: 'air',
        drive: this.mix({ footX: 5, kneeX: 10, ankleX: 6, kneeY: 8, ankleY: -1, footY: 0, footTilt: 0.02 }, { footX: -20, kneeX: -8, ankleX: -18, kneeY: -8, ankleY: -12, footY: -8, footTilt: 0.18 }, t),
        trail: this.mix({ footX: -8, kneeX: -3, ankleX: -7, kneeY: -19, ankleY: -20, footY: -12, footTilt: 0.28 }, { footX: 15, kneeX: 16, ankleX: 14, kneeY: -22, ankleY: -18, footY: -11, footTilt: -0.12 }, t),
        bodyBob: this.lerp(-7, -10, t),
        torsoLean: this.lerp(4, 3, t),
        headNod: this.lerp(1, -1, t)
      };
    }

    const t = this.smooth((phase - 0.58) / 0.42);
    return {
      phaseName: 'reach',
      drive: this.mix({ footX: -20, kneeX: -8, ankleX: -18, kneeY: -8, ankleY: -12, footY: -8, footTilt: 0.18 }, { footX: -30, kneeX: -17, ankleX: -27, kneeY: -2, ankleY: -3, footY: -2, footTilt: 0.2 }, t),
      trail: this.mix({ footX: 15, kneeX: 16, ankleX: 14, kneeY: -22, ankleY: -18, footY: -11, footTilt: -0.12 }, { footX: 26, kneeX: 15, ankleX: 23, kneeY: -2, ankleY: 0, footY: 0, footTilt: -0.1 }, t),
      bodyBob: this.lerp(-10, -1, t),
      torsoLean: this.lerp(3, 2.5, t),
      headNod: this.lerp(-1, 0, t)
    };
  }

  /**
   * Maps phase to a physical leg.
   *
   * @param {number} side - Side.
   * @param {number} driveSide - Driving side.
   * @param {number} trailSide - Trail side.
   * @param {Object} p - Phase.
   * @returns {Object} Leg.
   */
  static legForSide(side, driveSide, trailSide, p) {
    const src = side === driveSide ? p.drive : p.trail;
    return {
      role: side === driveSide ? 'drive' : 'trail',
      hipX: src.kneeX * 0.1,
      kneeX: src.kneeX,
      ankleX: src.ankleX,
      footX: src.footX,
      kneeY: src.kneeY,
      ankleY: src.ankleY,
      footY: src.footY,
      footTilt: src.footTilt,
      planted: src.footY === 0,
      alphaBoost: 1
    };
  }

  /**
   * Maps phase to arm.
   *
   * @param {number} side - Side.
   * @param {number} driveSide - Drive side.
   * @param {number} trailSide - Trail side.
   * @param {Object} p - Phase.
   * @returns {Object} Arm.
   */
  static armForSide(side, driveSide, trailSide, p) {
    const forward = side === trailSide;
    return {
      elbowX: forward ? 30 : 12,
      elbowY: forward ? 22 : 47,
      handX: forward ? 22 : 9,
      handY: forward ? 10 : 35,
      swing: forward ? 1 : -1,
      shoulderLift: forward ? -4 : 2
    };
  }

  /**
   * Smoothstep.
   *
   * @param {number} t - Raw.
   * @returns {number} Eased.
   */
  static smooth(t) {
    const x = Math.max(0, Math.min(1, t));
    return x * x * (3 - 2 * x);
  }

  /**
   * Lerp.
   *
   * @param {number} a - A.
   * @param {number} b - B.
   * @param {number} t - T.
   * @returns {number} Value.
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Mixes objects.
   *
   * @param {Object} a - A.
   * @param {Object} b - B.
   * @param {number} t - T.
   * @returns {Object} Mixed.
   */
  static mix(a, b, t) {
    const out = {};
    Object.keys(a).forEach(key => {
      out[key] = this.lerp(a[key], b[key], t);
    });
    return out;
  }
}