// B"H
import { BackgroundPainter } from './backgroundPainter.js';
import { LightPainter } from './lightPainter.js';
import { ParticleForge } from './particleForge.js';
import { VisualEventWatcher } from './visualEventWatcher.js';

/**
 * Lightning mode conductor. It keeps atmosphere, event sparks, and a clean rim,
 * but refuses every heavy operation. The Awtsmoos reveals that speed itself can
 * be a form of beauty when every wasted calculation is shattered.
 */
export class VisualEffects {
  constructor() {
    this.background = new BackgroundPainter();
    this.lights = new LightPainter();
    this.forge = new ParticleForge();
    this.watcher = new VisualEventWatcher(this.forge);
  }

  begin(c, world, view, camera, frame) {
    this.background.paint(c, world, view, camera, frame);
  }

  accents(c, world) {
    this.lights.door(c, world.level?.door, world.canExit?.());
    this.lights.hero(c, world.player);
  }

  finish(c, world) {
    this.watcher.watch(world);
    this.forge.step(1 / 60);
    this.forge.draw(c);
  }
}
