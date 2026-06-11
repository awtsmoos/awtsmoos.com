import { drawBackground } from './background.js';
import { drawPlatforms } from './platforms.js';
import { drawFighters } from './fighters.js';
import { drawWeapons, drawHeldWeapons } from './weapons.js';
import { drawParticles } from './particles.js';
import { drawUi } from './ui.js';
import { updateCamera } from '../camera/camera.js';

/**
 * B"H — Renderer assembly. Every subsystem draws one layer, like worlds
 * descending: background, platform, weapon, fighter, spark, and UI crown.
 */
export function draw(ctx, state, w, h) {
  ctx.clearRect(0, 0, w, h);
  drawBackground(ctx, state.map, w, h);
  updateCamera(state, w, h);
  ctx.save();
  ctx.translate(state.camera.x, state.camera.y);
  drawPlatforms(ctx, state.map.platforms, state.map);
  drawWeapons(ctx, state.weapons);
  drawHeldWeapons(ctx, state.fighters);
  drawFighters(ctx, state.fighters);
  drawParticles(ctx, state.particles);
  ctx.restore();
  drawUi(ctx, state, w);
}
