// B"H

/**
 * @file FacingResolver.js
 * @description
 * One authority for flip/view. Movement, dialogue, prop action, and camera do
 * not fight anymore.
 */
export class FacingResolver {
  /**
   * Resolves facing.
   *
   * @param {Object} data - Character data.
   * @param {Object} state - Performance state.
   * @param {Object} world - World info.
   * @returns {Object} Facing output.
   */
  static resolve(data, state, world = {}) {
    if (state.facing.mode === 'locked') {
      return {
        flipX: state.facing.explicitFlipX,
        view: state.facing.explicitView || 'threeQuarter'
      };
    }

    const chars = world.characters || {};
    const target = state.gaze.targetId ? chars[state.gaze.targetId] : null;
    const selfX = Number(data.position?.x || 0);

    if (state.locomotion.type !== 'idle' && data._travelDirection) {
      return {
        flipX: data._travelDirection < 0,
        view: 'side'
      };
    }

    if (target && target.position) {
      const targetX = Number(target.position.x || 0);
      const dx = targetX - selfX;
      return {
        flipX: dx < 0,
        view: Math.abs(dx) > 90 ? 'threeQuarter' : 'front'
      };
    }

    return {
      flipX: state.facing.explicitFlipX,
      view: state.facing.explicitView || data.view || 'threeQuarter'
    };
  }
}