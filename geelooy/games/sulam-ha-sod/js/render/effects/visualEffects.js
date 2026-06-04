// B"H
import { BackgroundPainter } from './backgroundPainter.js';
import { LightPainter } from './lightPainter.js';
import { ParticleForge } from './particleForge.js';
import { VisualEventWatcher } from './visualEventWatcher.js';

/**
 * Lightning mode conductor.
 *
 * Chapter 10: The Awtsmoos tightened the storm into a fast crown. Background,
 * door rays, hero outlines, and event sparks pass through one conductor, and
 * every shimmer knows its budget. No expensive haze is invited to the feast;
 * only crisp letters of light remain, counted, bounded, and alive.
 */
export class VisualEffects {
  constructor() {
    this.background = new BackgroundPainter();
    this.lights = new LightPainter();
    this.forge = new ParticleForge();
    this.watcher = new VisualEventWatcher(this.forge);
  }

  /**
   * Paints the cheap atmospheric background.
   *
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} c Context.
   * @param {object} world Game world.
   * @param {object} view Viewport data.
   * @param {object} camera Camera data.
   * @param {number} frame Renderer frame counter.
   * @returns {void}
   */
  begin(c, world, view, camera, frame) {
    this.background.paint(c, world, view, camera, frame);
  }

  /**
   * Paints bounded foreground accents.
   *
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} c Context.
   * @param {object} world Game world.
   * @param {number} frame Renderer frame counter.
   * @returns {void}
   */
  accents(c, world, frame = 0) {
    this.lights.door(c, world.level?.door, world.canExit?.(), frame);
    this.lights.hero(c, world.player, frame);
  }

  /**
   * Updates and draws pooled particles.
   *
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} c Context.
   * @param {object} world Game world.
   * @returns {void}
   */
  finish(c, world) {
    this.watcher.watch(world);
    this.forge.step(1 / 60);
    this.forge.draw(c);
  }
}
