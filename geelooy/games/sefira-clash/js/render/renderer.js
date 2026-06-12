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
 * Zoom-aware battle renderer with edge-arrow HUD support.
 *
 * Chapter 4: after the world is painted and the camera breathes, the border
 * itself becomes a messenger. Offscreen fighters are not hidden from the eye;
 * their signs are rendered after the world transform on the flat screen layer.
 */
export function draw(ctx, state, w, h) {
  ctx.clearRect(0, 0, w, h);
  drawBackground(ctx, state.map, w, h);
  updateCamera(state, w, h);
  const zoom = state.camera.zoom || 1;
  const view = makeView(state.camera, w, h, 300, zoom);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(state.camera.x - w / 2, state.camera.y - h / 2);
  drawPlatforms(ctx, visibleRects([...(state.map.platforms || []), ...(state.map.walls || [])], view), state.map);
  drawPowerups(ctx, visiblePoints(state.powerups || [], view));
  drawWeapons(ctx, visiblePoints(state.weapons, view));
  drawHeldWeapons(ctx, state.fighters);
  drawFighters(ctx, visiblePoints(state.fighters, view));
  drawParticles(ctx, visiblePoints(state.particles, view));
  ctx.restore();
  drawUi(ctx, state, w, h);
}

function makeView(camera, w, h, pad, zoom) {
  const halfW = w / (2 * zoom);
  const halfH = h / (2 * zoom);
  const centerX = w / 2 - camera.x;
  const centerY = h / 2 - camera.y;
  return { left: centerX - halfW - pad, right: centerX + halfW + pad, top: centerY - halfH - pad, bottom: centerY + halfH + pad };
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
