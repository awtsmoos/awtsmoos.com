
// B"H

/**
 * @file MobileViewportGuardian.js
 * @description
 * ============================================================================
 * CHAPTER: THE VIEWPORT THAT STOPPED LYING
 * ============================================================================
 *
 * The mobile browser bar rises like a wave and steals height from the stage.
 * This guardian measures the living viewport and writes CSS variables so the
 * stage, dock, timeline, and safe frame can agree about reality.
 *
 * @module MobileViewportGuardian
 */

/**
 * @class MobileViewportGuardian
 * @description
 * Maintains mobile viewport CSS variables.
 */
export class MobileViewportGuardian {
  /**
   * Binds viewport updates.
   *
   * @returns {Function} Cleanup function.
   */
  static bind() {
    const update = () => this.update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', update, { passive: true });
      window.visualViewport.addEventListener('scroll', update, { passive: true });
    }
    update();

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', update);
        window.visualViewport.removeEventListener('scroll', update);
      }
    };
  }

  /**
   * Writes CSS variables.
   *
   * @returns {Object} Measured viewport values.
   */
  static update() {
    const vv = window.visualViewport;
    const width = vv ? vv.width : window.innerWidth;
    const height = vv ? vv.height : window.innerHeight;
    const mobile = width <= 780 || height > width;
    const dock = mobile ? 122 : 68;
    const safeBottom = dock + 28;

    const root = document.documentElement;
    root.style.setProperty('--aw-real-vh', String(height) + 'px');
    root.style.setProperty('--aw-real-vw', String(width) + 'px');
    root.style.setProperty('--aw-dock-height', String(dock) + 'px');
    root.style.setProperty('--aw-stage-safe-bottom', String(safeBottom) + 'px');
    root.style.setProperty('--aw-mobile-mode', mobile ? '1' : '0');

    return { width, height, mobile, dock, safeBottom };
  }
}
