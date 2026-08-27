
// B"H
import { BehaviorRegistry } from '../BehaviorRegistry.js';
import { StruttEngine } from '../../../character/kinematics/locomotion/StruttEngine.js';
import { FallbackWalkCycle } from './locomotion/FallbackWalkCycle.js';
import { MotionModeRegistry } from './locomotion/MotionModeRegistry.js';
import { TextTrace } from '../../debug/TextTrace.js';

/**
 * @file LocomotionSystem.js
 * @description
 * ============================================================================
 * CHAPTER: THE WALK RETURNS WITHOUT BROKEN ESCAPED SYMBOLS
 * ============================================================================
 *
 * The previous file was killed by escaped HTML entities like &amp;&amp; inside
 * JavaScript source. This version uses real JavaScript operators only.
 *
 * It also makes animation easier and more alive:
 * idle, walk, talk, wave, point, shrug, think, clap, bounce, dance, and jump
 * all resolve through a tiny mode registry before entering the smooth body.
 *
 * The Awtsmoos creates movement from nothing every instant. A character should
 * never die because a single motion vessel cracked. If the rich StruttEngine
 * fails, the fallback walk keeps the world moving.
 *
 * @class LocomotionSystem
 */
export class LocomotionSystem {
  static keys = [
    'hipL',
    'kneeL',
    'hipR',
    'kneeR',
    'bob',
    'armL',
    'elbowL',
    'armR',
    'elbowR',
    'torsoSway',
    'footRollL',
    'footRollR'
  ];

  /**
   * Processes locomotion for one character.
   *
   * @param {Object} data - Character state.
   * @param {number} time - Real time.
   * @param {number} dt - Delta time.
   * @returns {void}
   */
  static process(data, time, dt) {
    if (!data) return;

    const playbackSpeed = Number.isFinite(data.playbackSpeed) ? data.playbackSpeed : 1.0;
    const velocityX = Number.isFinite(data.velocity?.x) ? data.velocity.x : 0;
    const movingByVelocity = Math.abs(velocityX) > 0.1;
    const walking = Boolean(data.isWalking || movingByVelocity);

    if (walking) {
      data.walkClock = (data.walkClock || 0) + (dt * playbackSpeed);
    }

    if (data.isDancing) {
      data.danceClock = (data.danceClock || 0) + (dt * playbackSpeed);
    }

    if (data.isJumping) {
      data.jumpClock = (data.jumpClock || 0) + (dt * playbackSpeed);
    }

    const mode = MotionModeRegistry.resolve(data, walking);
    data.motionMode = mode;

    let target = this.defaultTarget(data, time);

    if (mode === 'walk') {
      target = this.walkTarget(data, velocityX);
    } else {
      target = MotionModeRegistry.target(mode, data, time);
    }

    data.walk = data.walk || { ...target };

    this.keys.forEach((key) => {
      const current = Number.isFinite(data.walk[key]) ? data.walk[key] : 0;
      const next = Number.isFinite(target[key]) ? target[key] : 0;
      const friction = mode === 'idle' ? 0.10 : 0.18;
      data.walk[key] = (current * (1 - friction)) + (next * friction);
    });

    TextTrace.every(
      'LocomotionSystem',
      data.id || 'unknown',
      180,
      `id=${data.id || 'unknown'} mode=${mode} clock=${Math.round(data.walkClock || 0)}`
    );
  }

  /**
   * Builds the safe idle target.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Time.
   * @returns {Object} Target pose.
   */
  static defaultTarget(data, time) {
    const idleBehavior = BehaviorRegistry.get('idle')(time, data.mood);

    return {
      hipL: 0,
      kneeL: 2,
      hipR: 0,
      kneeR: 2,
      bob: idleBehavior.headBob || idleBehavior.breath || 0,
      armL: (idleBehavior.sway || 0) * 0.5,
      elbowL: 20 + ((idleBehavior.breath || 0) * 3),
      armR: -(idleBehavior.sway || 0) * 0.5,
      elbowR: 20 + ((idleBehavior.breath || 0) * 3),
      torsoSway: idleBehavior.sway || 0,
      footRollL: 0,
      footRollR: 0
    };
  }

  /**
   * Builds a walk target using rich StruttEngine with fallback.
   *
   * @param {Object} data - Character data.
   * @param {number} velocityX - Horizontal velocity.
   * @returns {Object} Target pose.
   */
  static walkTarget(data, velocityX) {
    let target;

    try {
      target = StruttEngine.calculate(data.walkClock || 0, data);
    } catch (error) {
      TextTrace.error(
        'LocomotionSystem',
        `StruttEngine failed for ${data.id || 'unknown'}; fallback walk engaged`,
        error
      );
      target = FallbackWalkCycle.calculate(data.walkClock || 0, data);
    }

    const baseIntensity = data.isWalking ? 1.0 : 0.0;
    const velocityIntensity = Math.min(1.25, Math.abs(velocityX) / 3);
    const intensity = Math.max(baseIntensity, velocityIntensity, 0.75);

    this.keys.forEach((key) => {
      target[key] = (target[key] || 0) * intensity;
    });

    return target;
  }
}
