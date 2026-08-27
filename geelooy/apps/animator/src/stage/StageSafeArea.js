
// B"H

/**
 * @file StageSafeArea.js
 * @description
 * ============================================================================
 * CHAPTER: THE MEASURED VESSEL OF THE MOBILE WORLD
 * ============================================================================
 *
 * The stage cannot trust window.innerHeight, browser bars, docks, timelines,
 * or old canvas getters. This module reads the actual physical canvas bitmap
 * and carves out a safe cinematic field where sky, road, humans, subtitles,
 * and editor chrome can coexist.
 *
 * @module StageSafeArea
 */

/**
 * @class StageSafeArea
 * @description
 * Resolves safe canvas-space dimensions for direct canvas render systems.
 */
export class StageSafeArea {
  /**
   * Resolves the current safe frame from an app object.
   *
   * @param {Object} app - App instance.
   * @returns {Object} Safe frame data in physical canvas pixels.
   */
  static resolve(app) {
    const canvas = app?.ctx?.canvas;
    const width = Math.max(1, canvas?.width || window.innerWidth || 800);
    const height = Math.max(1, canvas?.height || window.innerHeight || 600);
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const css = getComputedStyle(document.documentElement);
    const dockCss = parseFloat(css.getPropertyValue('--aw-dock-height')) || 122;
    const nle = document.getElementById('aw-nle-mount');
    const nleRect = nle ? nle.getBoundingClientRect() : { height: 0 };
    const nlePixels = Math.max(0, nleRect.height * dpr);
    const bottomChrome = Math.max(dockCss * dpr, nlePixels + 34 * dpr);
    const topChrome = 0;
    const bottom = Math.max(height * 0.52, height - bottomChrome);
    const stageHeight = Math.max(1, bottom - topChrome);

    return {
      width,
      height,
      dpr,
      left: 0,
      top: topChrome,
      right: width,
      bottom,
      bottomChrome,
      centerX: width * 0.5,
      centerY: topChrome + stageHeight * 0.5,
      stageHeight,
      skyBottom: topChrome + stageHeight * 0.51,
      cityBase: topChrome + stageHeight * 0.76,
      sidewalkTop: topChrome + stageHeight * 0.78,
      roadTop: topChrome + stageHeight * 0.88,
      actorGroundY: topChrome + stageHeight * 0.86,
      actorTop: topChrome + stageHeight * 0.42,
      actorBottom: topChrome + stageHeight * 0.89
    };
  }
}
