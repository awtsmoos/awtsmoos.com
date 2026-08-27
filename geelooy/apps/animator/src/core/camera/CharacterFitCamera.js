
// B"H

/**
 * @file CharacterFitCamera.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE CAMERA THAT REFUSED THE BLACK ABYSS
 * ═══════════════════════════════════════════════════════════════
 *
 * The screenshot showed the world as a thin strip surrounded by black void.
 * That means the camera and canvas were not jointly honoring the character
 * bounds. This class creates a simple fit camera from character positions.
 *
 * It does not replace a cinematic director. It gives the director a truthful
 * default when no better camera is active.
 *
 * The Awtsmoos is not contained by the frame. But a canvas scene must be.
 *
 * @class CharacterFitCamera
 */
export class CharacterFitCamera {
  /**
   * Computes a camera for the current characters and canvas shape.
   *
   * @param {Object} characters - Character map.
   * @param {HTMLCanvasElement} canvas - Canvas element.
   * @param {Object} config - Optional camera config.
   * @returns {Object} Camera object with x, y, and zoom.
   */
  static compute(characters, canvas, config = {}) {
    const rect = canvas?.getBoundingClientRect?.() || { width: 800, height: 800 };
    const mobile = rect.height > rect.width;
    const base = {
      x: Number.isFinite(config.x) ? config.x : 0,
      y: Number.isFinite(config.y) ? config.y : -155,
      zoom: Number.isFinite(config.zoom) ? config.zoom : 1.15
    };

    const points = Object.values(characters || {})
      .map(char => char?.position)
      .filter(Boolean);

    if (!points.length) {
      return mobile
        ? { x: base.x, y: config.mobileY || -178, zoom: config.mobileZoom || 1.42 }
        : base;
    }

    const xs = points.map(p => Number.isFinite(p.x) ? p.x : 0);
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const spanX = Math.max(420, Math.max(...xs) - Math.min(...xs) + (config.safePadding || 120));

    const zoomByWidth = rect.width > 0 ? rect.width / spanX : base.zoom;
    const zoom = mobile
      ? Math.max(1.12, Math.min(config.mobileZoom || 1.46, zoomByWidth))
      : Math.max(0.86, Math.min(1.3, zoomByWidth));

    return {
      x: centerX,
      y: mobile ? config.mobileY || -178 : base.y,
      zoom
    };
  }
}
