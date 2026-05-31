// B"H
import { Renderer as LegacyRenderer } from './legacyRenderer.js';
import { VisualEffects } from '../render/effects/visualEffects.js';

/**
 * Renderer, lightning mode.
 *
 * Chapter 3 — The Awtsmoos commanded the canvas to stop lumbering and start
 * flying. The old renderer draws the real game. This wrapper only swaps the
 * sky and adds tiny event sparks. No second visibility pass, no per-coin glow,
 * no blur, no expensive blend mode. The level remains untouched; the frame
 * becomes a chariot of speed.
 */
export class Renderer extends LegacyRenderer {
  constructor(canvas, options = {}) {
    super(canvas, options);
    this.visualEffects = new VisualEffects();
    this.effectWorld = null;
  }

  /** @param {object} world active physics world @returns {void} */
  draw(world) {
    this.effectWorld = world;
    super.draw(world);
    this.paintFastEventSparks(world);
  }

  /** @param {CanvasRenderingContext2D} c context @returns {void} */
  background(c) {
    const world = this.effectWorld;
    if (!world) { super.background(c); return; }
    this.visualEffects.begin(c, world, this.view, this.camera, this.frame);
  }

  /** @param {object} world active physics world @returns {void} */
  paintFastEventSparks(world) {
    if (!this.ctx || !world?.player || world.deathPause) return;
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);
    this.visualEffects.accents(this.ctx, world);
    this.visualEffects.finish(this.ctx, world);
    this.ctx.restore();
  }
}
