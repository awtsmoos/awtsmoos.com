
// B"H
import { GestureLibrary } from './GestureLibrary.js';
import { AwtsmoosMath } from '../../engine/core/AwtsmoosMath.js';

/**
 * @file ActingEngine.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SHRUG THAT FINALLY REACHED THE ARMS
 * ═══════════════════════════════════════════════════════════════
 *
 * Confirmed issue:
 * GestureLibrary defined shrug arm rotations, but the old ActingEngine only
 * applied shouldersY, headTilt, and armR.ikTarget. A scheduled shrug could
 * leave arms in stale walking or IK states, making them look broken.
 *
 * Rectification:
 * - Generic armL and armR gesture values are now copied into data.poseArms.
 * - IK gestures still use ikTargetRight when explicitly defined.
 * - Neutral state smooths shoulders and head without leaving poseArms trapped.
 *
 * The Awtsmoos creates motion from silence. But if the command says "shrug",
 * the arm must hear it too.
 *
 * @class ActingEngine
 */
export class ActingEngine {
  /**
   * Applies a named acting gesture to character data.
   *
   * @param {Object} data - Character state object.
   * @param {number} time - Current animation time.
   * @returns {Object} Mutated character data for compatibility with existing engine.
   */
  static apply(data, time) {
    const activeGestureKey = data.acting;

    if (!activeGestureKey || activeGestureKey === 'neutral') {
      data.shouldersYOffset = AwtsmoosMath.lerp(data.shouldersYOffset || 0, 0, 0.1);
      data.headTilt = AwtsmoosMath.lerp(data.headTilt || 0, 0, 0.1);
      data.poseArms = null;
      return data;
    }

    if (activeGestureKey === 'brush_teeth_motion') {
      return this.applyBrushTeeth(data, time);
    }

    const gesture = GestureLibrary.get(activeGestureKey);
    if (!gesture) return data;

    const friction = 0.12;

    if (gesture.shouldersY !== undefined) {
      data.shouldersYOffset = AwtsmoosMath.lerp(data.shouldersYOffset || 0, gesture.shouldersY, friction);
    }

    if (gesture.headTilt !== undefined) {
      data.headTilt = AwtsmoosMath.lerp(data.headTilt || 0, gesture.headTilt, friction);
    }

    this.applyArmPose(data, gesture, friction);
    return data;
  }

  /**
   * Applies the brush-teeth procedural macro.
   *
   * @param {Object} data - Character state object.
   * @param {number} time - Current time.
   * @returns {Object} Mutated character state.
   */
  static applyBrushTeeth(data, time) {
    const scrubY = Math.sin(time * 0.03) * 10;
    const scrubX = Math.cos(time * 0.03) * 6;
    const target = { x: 12 + scrubX, y: -70 + scrubY };

    data.ikTargetRight = data.ikTargetRight || target;
    data.ikTargetRight.x = AwtsmoosMath.lerp(data.ikTargetRight.x, target.x, 0.2);
    data.ikTargetRight.y = AwtsmoosMath.lerp(data.ikTargetRight.y, target.y, 0.2);
    data.headTilt = AwtsmoosMath.lerp(data.headTilt || 0, Math.sin(time * 0.01) * 3, 0.1);

    return data;
  }

  /**
   * Applies arm gesture data in both plain-angle and IK formats.
   *
   * @param {Object} data - Character state object.
   * @param {Object} gesture - Gesture definition.
   * @param {number} friction - Smoothing coefficient.
   * @returns {void}
   */
  static applyArmPose(data, gesture, friction) {
    data.poseArms = data.poseArms || {};

    ['armL', 'armR'].forEach(key => {
      const def = gesture[key];
      if (!def) return;

      const side = key === 'armL' ? 'left' : 'right';
      const existing = data.poseArms[side] || { upper: 0, lower: 0 };

      if (Number.isFinite(def.upper)) {
        existing.upper = AwtsmoosMath.lerp(existing.upper || 0, def.upper, friction);
      }

      if (Number.isFinite(def.lower)) {
        existing.lower = AwtsmoosMath.lerp(existing.lower || 0, def.lower, friction);
      }

      data.poseArms[side] = existing;

      if (def.ikTarget && side === 'right') {
        data.ikTargetRight = data.ikTargetRight || { ...def.ikTarget };
        data.ikTargetRight.x = AwtsmoosMath.lerp(data.ikTargetRight.x, def.ikTarget.x, friction);
        data.ikTargetRight.y = AwtsmoosMath.lerp(data.ikTargetRight.y, def.ikTarget.y, friction);
      }
    });
  }
}
