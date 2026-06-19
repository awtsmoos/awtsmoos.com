
// B"H
import { BehaviorRegistry } from '../../BehaviorRegistry.js';
import { EasyMotionPresets } from './EasyMotionPresets.js';

/**
 * @file MotionModeRegistry.js
 * @description
 * ============================================================================
 * CHAPTER: THE SIMPLE GATE OF MANY MOTIONS
 * ============================================================================
 *
 * This tiny registry makes animation easy.
 * The character can ask for `easyMotion: "wave"` or `acting: "shrug"`,
 * and the body receives a complete simple pose.
 *
 * The Awtsmoos creates many movements inside one life:
 * a wave, a laugh, a step, a nod, a thought, a clap, a dance.
 * Each motion is a small vessel. Each vessel receives a name.
 *
 * @class MotionModeRegistry
 */
export class MotionModeRegistry {
  /**
   * Resolves a motion mode from character state.
   *
   * @param {Object} data - Character data.
   * @param {boolean} walking - Whether locomotion says walking.
   * @returns {string} Motion mode.
   */
  static resolve(data, walking) {
    if (data.isJumping) return 'jump';
    if (data.isDancing) return 'dance';
    if (data.isClapping || data.easyMotion === 'clap') return 'clap';
    if (data.easyMotion === 'wave' || data.isWaving) return 'wave';
    if (data.easyMotion === 'point') return 'point';
    if (data.easyMotion === 'think' || data.acting === 'thinker') return 'think';
    if (data.easyMotion === 'shrug' || data.acting === 'shrug') return 'shrug';
    if (data.easyMotion === 'bounce') return 'bounce';
    if (walking) return 'walk';
    if (data.isTalking) return 'talk';
    return 'idle';
  }

  /**
   * Returns a target for a non-walk mode.
   *
   * @param {string} mode - Motion mode.
   * @param {Object} data - Character data.
   * @param {number} time - Current time.
   * @returns {Object} Motion target.
   */
  static target(mode, data, time) {
    const map = {
      idle: () => EasyMotionPresets.idle(data, time),
      talk: () => EasyMotionPresets.talk(data, time),
      wave: () => EasyMotionPresets.wave(data, time),
      point: () => EasyMotionPresets.point(data, time),
      shrug: () => EasyMotionPresets.shrug(data, time),
      think: () => EasyMotionPresets.think(data, time),
      clap: () => BehaviorRegistry.get('clap')(time),
      dance: () => BehaviorRegistry.get('dance')(data.danceClock || time),
      jump: () => BehaviorRegistry.get('jump')(data.jumpClock || time),
      bounce: () => EasyMotionPresets.bounce(data, time)
    };

    const fn = map[mode] || map.idle;
    return fn();
  }
}
