// B"H
import { Renderer as LegacyRenderer } from './legacyRenderer.js';
import { VisualEffects } from '../render/effects/visualEffects.js';

/**
 * LightningRenderer keeps the current visible game exactly recognizable.
 *
 * Chapter 6: Before the worker chamber opened, the Awtsmoos preserved the old
 * painter as a sealed flask of light. Background atmosphere, event sparks, and
 * hard collision shapes still move with the same grammar; this class is now the
 * canonical painter used by both main-thread fallback and the Offscreen worker.
 */
export class LightningRenderer extends LegacyRenderer {
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

  /** @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} c context @returns {void} */
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
