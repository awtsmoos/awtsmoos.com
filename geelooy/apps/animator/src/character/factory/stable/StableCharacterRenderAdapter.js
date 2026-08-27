
// B"H
import { StableCharacterAssembler } from './StableCharacterAssembler.js';

/**
 * @file StableCharacterRenderAdapter.js
 * @description
 * ============================================================================
 * CHAPTER: THE REAL CHARACTER GATE
 * ============================================================================
 *
 * This adapter does exactly one thing:
 *
 * It calls the real StableCharacterAssembler.
 *
 * It does not create replacement people.
 * It does not draw fallback bodies.
 * It does not add skeleton experiments.
 * It does not force scale, position, crowd layout, or emergency art.
 *
 * The only compatibility behavior is:
 * - prefer build() if it exists
 * - otherwise call assemble()
 *
 * If the real renderer fails, this returns null and logs the failure. That is
 * intentional: no fake placeholders.
 *
 * @module StableCharacterRenderAdapter
 */

console.info('B"H StableCharacterRenderAdapter real-only: no fallback people.');

/**
 * @class StableCharacterRenderAdapter
 * @description
 * Real stable character adapter.
 */
export class StableCharacterRenderAdapter {
  static errorCounts = new Map();

  /**
   * Renders one real character.
   *
   * @param {Object} character - Hydrated character data.
   * @param {Object} ctx - Render context.
   * @param {Object} state - App state.
   * @returns {Object|null} Render result or null.
   */
  static render(character, ctx, state) {
    const fn = StableCharacterAssembler.build || StableCharacterAssembler.assemble;

    if (typeof fn !== 'function') {
      this.logThrottled(character, new Error('StableCharacterAssembler has no build or assemble method.'));
      return null;
    }

    try {
      const node = fn.call(StableCharacterAssembler, character, ctx, state);

      if (!node) {
        this.logThrottled(character, new Error('StableCharacterAssembler returned no node.'));
        return null;
      }

      return {
        node,
        bounds: this.bounds(character),
        hitRegion: this.hitRegion(character),
        failed: false,
        real: true
      };
    } catch (error) {
      this.logThrottled(character, error);
      return null;
    }
  }

  /**
   * Logs failures without flooding the console.
   *
   * @param {Object} character - Character data.
   * @param {Error} error - Error.
   * @returns {void}
   */
  static logThrottled(character, error) {
    const key = (character?.id || 'unknown') + '::' + (error?.message || String(error));
    const count = (this.errorCounts.get(key) || 0) + 1;
    this.errorCounts.set(key, count);

    if (count <= 4) {
      console.warn('B"H - Real character renderer failed. No placeholder drawn.', character?.id || 'unknown', error);
    } else if (count === 5) {
      console.warn('B"H - Repeated real character renderer errors suppressed for:', character?.id || 'unknown');
    }
  }

  /**
   * Computes broad hit bounds from original character position.
   *
   * @param {Object} character - Character data.
   * @returns {Object} Bounds.
   */
  static bounds(character = {}) {
    const pos = character.position || {};
    const x = Number(pos.x) || Number(character.x) || 0;
    const y = Number(pos.y) || Number(character.y) || 0;
    const scale = Math.max(0.2, Math.min(2, Number(character.scale) || 1));

    return {
      x: x - 70 * scale,
      y: y - 230 * scale,
      width: 140 * scale,
      height: 250 * scale
    };
  }

  /**
   * Creates hit region for the real character.
   *
   * @param {Object} character - Character data.
   * @returns {Object} Hit region.
   */
  static hitRegion(character = {}) {
    const bounds = this.bounds(character);

    return {
      id: character.id || 'character_unknown',
      entityType: 'character',
      part: 'fullBody',
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      depth: Number(character.depth ?? character.z ?? 0),
      payload: {
        name: character.name || character.id || 'Character',
        realOnly: true
      }
    };
  }
}
