import { drawBackground } from './background.js';
import { drawPlatforms } from './platforms.js';
import { drawFighters } from './fighters.js';
import { drawWeapons, drawHeldWeapons } from './weapons.js';
import { drawPowerups } from './powerups.js';
import { drawParticles } from './particles.js';
import { drawUi } from './ui.js';
import { updateCamera } from '../camera/camera.js';

/**
 * B"H
 * Camera-aware battle renderer.
 *
 * Chapter 22: the world is vast, but only the revealed chamber is drawn.
 * Platforms, power-ups, particles, weapons, and fighters all pass through the
 * same view gate so scale does not devour performance.
 */
export function draw(ctx, state, w, h) {
  ctx.clearRect(0, 0, w, h);
  drawBackground(ctx, state.map, w, h);
  updateCamera(state, w, h);
  const view = makeView(state.camera, w, h, 260);
  ctx.save();
  ctx.translate(state.camera.x, state.camera.y);
  drawPlatforms(ctx, visibleRects(state.map.platforms, view), state.map);
  drawPowerups(ctx, visiblePoints(state.powerups || [], view));
  drawWeapons(ctx, visiblePoints(state.weapons, view));
  drawHeldWeapons(ctx, state.fighters);
  drawFighters(ctx, visiblePoints(state.fighters, view));
  drawParticles(ctx, visiblePoints(state.particles, view));
  ctx.restore();
  drawUi(ctx, state, w);
}

function makeView(camera, w, h, pad) {
  return { left: -camera.x - pad, right: -camera.x + w + pad, top: -camera.y - pad, bottom: -camera.y + h + pad };
}

function visibleRects(items, view) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const r = items[i];
    if (r.x + r.w >= view.left && r.x <= view.right && r.y + r.h >= view.top && r.y <= view.bottom) out.push(r);
  }
  return out;
}

function visiblePoints(items, view) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const p = items[i];
    if (!p || p.dead || p.active === false) continue;
    if (p.x >= view.left && p.x <= view.right && p.y >= view.top && p.y <= view.bottom) out.push(p);
  }
  return out;
}
