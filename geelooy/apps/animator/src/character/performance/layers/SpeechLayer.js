
// B"H

/**
 * @file SpeechLayer.js
 * @description
 * ============================================================================
 * CHAPTER: THE SPEECH LAYER THAT MOVED THE MOUTH WITHOUT SUMMONING ERRORS
 * ============================================================================
 *
 * This layer is static-only. It never requires new. It adds mouth rhythm and
 * a tiny head nod while leaving the stable body alone.
 *
 * @module SpeechLayer
 */

/**
 * @class SpeechLayer
 * @description
 * Safe speech performance layer.
 */
export class SpeechLayer {
  /**
   * Applies speech influence.
   *
   * @param {Object} pose - Pose object.
   * @param {Object} state - Performance state.
   * @param {Object} view - View data.
   * @param {number} time - Render time.
   * @param {Object} world - World data.
   * @returns {Object} Pose.
   */
  static apply(pose, state, view, time, world = {}) {
    const raw = state.raw || state.data || {};
    const text = String(state.dialogue || raw.dialogue || raw.speech || '');
    const active = Boolean(state.speech === 'talk' || raw.speaking || text);

    pose.face = pose.face || {};
    pose.body = pose.body || {};

    if (!active) {
      pose.face.mouthOpen = pose.face.mouthOpen ?? 0.04;
      return pose;
    }

    const beat = Math.abs(Math.sin(time * 0.0105));
    pose.face.mouthOpen = 0.1 + beat * 0.68;
    pose.face.mouthWide = 0.08 + Math.sin(time * 0.006) * 0.08;
    pose.body.headNod = Math.sin(time * 0.0048) * 1.2;

    return pose;
  }

  /**
   * Sample-compatible layer entry.
   *
   * @param {Object} args - Runner args.
   * @returns {Object} Pose.
   */
  static sample(args = {}) {
    return this.apply(args.pose || {}, args.state || {}, args.view || {}, args.time || 0, args.world || {});
  }
}
