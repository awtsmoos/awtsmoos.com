// B"H

/**
 * @file RenderDetailResolver.js
 * @description
 * Converts camera zoom/detail intent into character render detail.
 */
export class RenderDetailResolver {
  /**
   * Resolves detail mode.
   *
   * @param {Object} data - Character data.
   * @returns {string} Detail mode.
   */
  static resolve(data = {}) {
    const forced = data._camera?.renderDetailMode;
    if (forced) return forced;

    const zoom = Number(data._camera?.zoom || 0.6);
    if (zoom > 0.8) return 'extremeCloseup';
    if (zoom > 0.72) return 'closeup';
    if (zoom < 0.56) return 'wide';
    return 'medium';
  }
}