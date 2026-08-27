
// B"H
/**
 * @file ZoomLogic.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE AGGRESSIVE LENS (HaAdasha HaAzit)
 * ═══════════════════════════════════════════════════════════════
 * 
 * RECTIFICATION: Increased the padding margin to 0.85, 
 * allowing characters to occupy much more of the screen.
 */
export class ZoomLogic {
  static calculateFit(bounds, canvasW, canvasH, baseZoom) {
    // B"H - Allow characters to take up 85% of the screen width
    const margin = 0.85; 

    const zoomW = (canvasW * margin) / (bounds.width || 1);
    const zoomH = (canvasH * margin) / (bounds.height || 1);

    // The most restrictive zoom to fit everyone
    const autoFitZoom = Math.min(zoomW, zoomH);

    // If it's a tight shot (closeup), try to respect the preset
    // but never clip the boundaries.
    const finalZoom = Math.min(baseZoom, autoFitZoom);

    return Math.max(0.1, Math.min(4.0, finalZoom));
  }
}
