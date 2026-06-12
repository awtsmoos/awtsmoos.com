import { drawBackground } from './background.js';
import { drawPlatforms } from './platforms.js';
import { drawFighters } from './fighters.js';
import { drawWeapons, drawHeldWeapons } from './weapons.js';
import { drawPowerups } from './powerups.js';
import { drawParticles } from './particles.js';
import { drawUi } from './ui.js';
import { updateCamera } from '../camera/camera.js';
import { drawHazards } from '../stage/hazards/hazardRender.js';
import { drawObjective } from '../stage/objectives/objectiveDirector.js';
import { drawBattlefieldScars } from '../stage/scars/battlefieldScars.js';

/**
 * B"H
 * Zoom-aware battle renderer with living-stage layers.
 *
 * Chapter 161: the sacred capture rune joins the visible battlefield between
 * hazard telegraphs and relics, so players can fight over what the arena names.
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
  drawBattlefieldScars(ctx, visiblePoints(state.scars || [], view));
  drawPlatforms(ctx, visibleRects([...(state.map.platforms || []), ...(state.map.walls || [])], view), state.map);
  drawHazards(ctx, visibleHazards(state.hazards || [], view));
  drawObjective(ctx, state.objective);
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

function visibleHazards(items, view) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const p = items[i];
    if (!p) continue;
    const r = p.radius || 100;
    if (p.x + r >= view.left && p.x - r <= view.right && p.y + r >= view.top && p.y - r <= view.bottom) out.push(p);
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
