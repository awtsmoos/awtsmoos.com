
// B"H
/**
 * @file FrustumSystem.js
 */
export class FrustumSystem {
  /**
   * @function calculateZoom
   * @description Fits characters into the viewport aggressively.
   */
  static calculateZoom(bounds, viewW, viewH, shotZoom) {
    // B"H - Increased occupancy from 65% to 90%
    const margin = 0.90; 

    const fitW = (viewW * margin) / (bounds.width || 1);
    const fitH = (viewH * margin) / (bounds.height || 1);

    const autoFitZoom = Math.min(fitW, fitH);
    
    // For specific closeups, we can go tighter, up to 3.5x
    const finalZoom = Math.min(shotZoom, autoFitZoom);

    return Math.max(0.1, Math.min(3.5, finalZoom));
  }
}
