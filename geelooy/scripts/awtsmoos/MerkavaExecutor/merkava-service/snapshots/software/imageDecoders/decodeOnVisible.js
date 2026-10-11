// B"H
/**
 * @file decodeOnVisible.js
 * @description
 * Bridges VisibleImageRegistry (viewport culling) with imageLoader (decoding).
 * Page renderers register <img> elements with their page rects; images decode
 * only when near the viewport, and evict when far away.
 *
 * Usage:
 *   import { DecodeOnVisible } from './decodeOnVisible.js';
 *   const dov = new DecodeOnVisible();
 *   // During layout: dov.registerImage(id, x, y, w, h, bytes);
 *   // During paint/scroll: await dov.ensureVisible(viewport);
 *   //   const img = dov.getDecoded(id); // null if not yet decoded
 *   // On scroll far: dov.evictFar(viewport);
 */

import { VisibleImageRegistry } from '../viewportCulling.js';
import { decodeImage } from './imageLoader.js';

export class DecodeOnVisible {
  constructor() {
    this.registry = new VisibleImageRegistry();
  }

  /**
   * Register an image for decode-on-visible.
   * @param {string} id - Unique image ID (e.g., element ID + src)
   * @param {number} x,y,w,h - Page rect in CSS pixels
   * @param {Uint8Array} bytes - Raw image bytes (fetched by page loader)
   */
  registerImage(id, x, y, w, h, bytes) {
    this.registry.register(id, x, y, w, h, async () => {
      return await decodeImage(bytes);
    });
  }

  /** Decode all images near the viewport. Returns count newly decoded. */
  async ensureVisible(viewport) {
    return await this.registry.ensureVisible(viewport);
  }

  /** Get decoded image (or null if not yet decoded/visible). */
  getDecoded(id) {
    return this.registry.get(id);
  }

  /** Evict decoded images far from viewport to bound memory. Returns count evicted. */
  evictFar(viewport, evictMargin) {
    return this.registry.evictFar(viewport, evictMargin);
  }

  get decodedCount() {
    return this.registry.decodedCount;
  }
}
