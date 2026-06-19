
// B"H
import { ScreenWorldMapper } from './ScreenWorldMapper.js';
import { CharacterHitTester } from './CharacterHitTester.js';

/**
 * @file SelectionBridge.js
 * @description
 * ============================================================================
 * CHAPTER: THE CLICK THAT BECAME DAAS
 * ============================================================================
 *
 * The editor needed more than buttons. It needed a covenant between the canvas
 * and the NLE. This bridge listens to the stage, finds the clicked character,
 * stores selection, and awakens inspectors and timeline highlights.
 *
 * @module SelectionBridge
 */

/**
 * @class SelectionBridge
 * @description
 * Connects canvas pointer events to app selection state.
 */
export class SelectionBridge {
  /**
   * Binds selection to a canvas.
   *
   * @param {Object} app - App object.
   * @returns {Function} Cleanup function.
   */
  static bind(app) {
    const canvas = app && app.ctx && app.ctx.canvas;
    const state = app && app.state;
    if (!canvas || !state) return () => {};

    const onPointerDown = event => {
      const point = ScreenWorldMapper.toCanvas(event, canvas);
      const regions = state.get ? state.get('hit_regions') || [] : [];
      const hit = CharacterHitTester.hit(regions, point);
      if (hit) {
        this.select(state, hit.id, hit);
        event.preventDefault();
      } else {
        this.select(state, null, null);
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    return () => canvas.removeEventListener('pointerdown', onPointerDown);
  }

  /**
   * Stores selected entity and broadcasts the change.
   *
   * @param {Object} state - App state.
   * @param {string|null} id - Entity id.
   * @param {Object|null} region - Hit region.
   * @returns {void}
   */
  static select(state, id, region) {
    if (state && state.set) {
      state.set('selected_entity_id', id);
      state.set('selected_hit_region', region);
    }
    window.dispatchEvent(new CustomEvent('nle-selection-changed', {
      detail: { id, region }
    }));
  }
}
