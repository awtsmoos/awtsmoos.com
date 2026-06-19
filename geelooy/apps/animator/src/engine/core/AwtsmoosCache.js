
// B"H
/**
 * @file AwtsmoosCache.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 1: THE MEMORY OF THE ETERNAL BREATH (Zikaron HaNeshima)
 * ============================================================================
 * "Forever, O Lord, Your Word stands in the heavens."
 * If the Awtsmoos were to withdraw the ten statements of creation for even a 
 * microsecond, all of reality would revert to absolute nothingness (Tohu Va-Vohu).
 * 
 * To force the mortal CPU to calculate 10,000 fractal tree branches 60 times 
 * a second is the Shattering of the Vessels (Shevirat HaKelim). It melts the core!
 * 
 * Thus, we forge the AwtsmoosCache. This is the realm of Yetzirah (Formation),
 * where the divine decree is spoken once, captured into a physical manifestation 
 * (an OffscreenCanvas), and held in stasis. It is redrawn instantly, sparing the 
 * engine from the avalanche of Garbage Collection.
 * ============================================================================
 */

export class AwtsmoosCache {
  static vault = new Map();

  /**
   * Captures the chaotic rendering of complex vectors into a static, lightning-fast bitmap.
   */
  static crystallize(id, width, height, renderCallback) {
    if (this.vault.has(id)) {
      return this.vault.get(id);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // The Creator speaks, and the canvas records the echo.
    renderCallback(ctx);

    this.vault.set(id, canvas);
    return canvas;
  }

  static purge(id) {
    this.vault.delete(id);
  }

  static shatter() {
    this.vault.clear();
  }
}
