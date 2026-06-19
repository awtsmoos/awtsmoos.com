
// B"H
/**
 * @file ResponsiveEngine.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE OMNISCIENT OBSERVER (Tzofeh HaKol)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Media queries are slow to evaluate complex hierarchies. 
 * This engine hooks directly into the browser's resize and orientation 
 * events, calculating the nature of the physical device and stamping 
 * absolute data-attributes onto the `<html>` root tag.
 * 
 * This allows our CSS to write rules like `html[data-device="mobile"] .panel`
 * ensuring flawless, instant structural shifts.
 * 
 * @class ResponsiveEngine
 */

export class ResponsiveEngine {
  /**
   * @function bind
   * @description Awakens the observer to watch the dimensions of reality.
   */
  static bind() {
    const evaluate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      const isMobile = w <= 1024;
      const isLandscape = w > h;
      const isUltraWide = w >= 2400;

      const html = document.documentElement;

      // Stamp the device nature
      html.dataset.device = isMobile ? 'mobile' : 'desktop';
      
      // Stamp the orientation
      html.dataset.orientation = isLandscape ? 'landscape' : 'portrait';

      // Stamp ultra-wide expansion
      if (isUltraWide) {
        html.dataset.ultrawide = 'true';
      } else {
        delete html.dataset.ultrawide;
      }

      // Log the dimensional shift to the heavens
      // console.log(`B"H - Reality Reshaped: ${w}x${h} [${html.dataset.device}, ${html.dataset.orientation}]`);
    };

    // Evaluate on boot
    evaluate();

    // Listen continuously
    window.addEventListener('resize', evaluate, { passive: true });
    window.addEventListener('orientationchange', evaluate, { passive: true });
  }
}
