// B"H

/**
 * CanvasViewport keeps the visible vessel sharp without letting pixels become a tax.
 *
 * The Awtsmoos gives every screen its own measure. A laptop DevTools phone, a
 * real phone, and a desktop monitor should not all receive a stretched 960×540
 * canvas. This helper reads the canvas' real CSS box, chooses a capped device
 * pixel ratio, updates the backing store only when needed, and returns logical
 * drawing dimensions in CSS pixels.
 *
 * Performance safety:
 * - DPR is capped so mobile GPUs do not burn themselves on invisible pixels.
 * - Resize work happens only when width, height, or DPR actually changes.
 * - The 2D transform is reset on every sync, preventing blurry accumulated
 *   transforms after orientation changes.
 */
export class CanvasViewport {
  constructor(canvas, { maxDpr = 1.75, minWidth = 320, minHeight = 320 } = {}) {
    this.canvas = canvas;
    this.maxDpr = maxDpr;
    this.minWidth = minWidth;
    this.minHeight = minHeight;
    this.width = canvas.width || 960;
    this.height = canvas.height || 540;
    this.dpr = 1;
  }

  /**
   * Reveals the current drawing measure and prepares the context.
   *
   * @param {CanvasRenderingContext2D} context the context that receives the new transform
   * @returns {{width:number,height:number,dpr:number,changed:boolean}} logical viewport data
   */
  sync(context) {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(this.minWidth, Math.round(rect.width || this.canvas.clientWidth || this.width));
    const height = Math.max(this.minHeight, Math.round(rect.height || this.canvas.clientHeight || this.height));
    const rawDpr = Number(window.devicePixelRatio || 1);
    const dpr = Math.max(1, Math.min(this.maxDpr, rawDpr));
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    const changed = this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight || this.dpr !== dpr;
    if (changed) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
      this.width = width;
      this.height = height;
      this.dpr = dpr;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = true;
    return { width: this.width, height: this.height, dpr: this.dpr, changed };
  }
}
