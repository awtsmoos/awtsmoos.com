/**
 * B"H
 * V3 UI renderer with Adventure gate HUD.
 *
 * The old topbar stays dethroned. Damage remains king for combat, but Adventure
 * now has its own crown: Sparks, hidden Sparks, enemies, and exit state.
 */
import { drawAdventureHud } from './v3/hud/AdventureHud.js';
import { drawV3Hud } from './v3/hud/index.js';
import { drawOffscreenArrow } from './v3/hud/OffscreenArrow.js';

export function drawUi(ctx, state, w, h = innerHeight) {
  drawV3Hud(ctx, state, w, h);
  drawAdventureHud(ctx, state, w, h);
  drawOffscreenFighterBeacons(ctx, state, w, h, w < 760);
  drawRespawnCountdown(ctx, state, w, h);
  if (state.winner) drawWinner(ctx, state, w, h);
}

function drawOffscreenFighterBeacons(ctx, state, w, h, mobile) {
  if (!state.camera) return;
  const top = mobile ? 150 : state.adventureRun ? 158 : 74;
  const bottom = h - 104;
  for (const f of state.fighters) {
    if (!f || f.dead || f.hidden || (f.human && !state.camera.spectating)) continue;
    const s = worldToScreen(f, state.camera, w, h);
    if (s.x > 20 && s.x < w - 20 && s.y > top && s.y < bottom) continue;
    drawOffscreenArrow(ctx, clamp(s.x, 20, w - 20), clamp(s.y, top, bottom), Math.atan2(s.y - clamp(s.y, top, bottom), s.x - clamp(s.x, 20, w - 20)), `hsl(${f.dna.hue} 90% 60%)`);
  }
}

function worldToScreen(f, camera, w, h) {
  const z = camera.zoom || 1;
  return { x: w / 2 + z * (f.x + camera.x - w / 2), y: h / 2 + z * (f.y - 95 + camera.y - h / 2) };
}

function drawRespawnCountdown(ctx, state, w, h) {
  const f = state.fighters.find(item => item.human && item.respawnTimer > 0 && !item.dead);
  if (!f) return;
  const n = Math.max(1, Math.ceil(f.respawnTimer / 30));
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.arc(w / 2, h * 0.44, 54, 0, Math.PI * 2); ctx.fill();
  ctx.font = '950 48px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff2a8'; ctx.fillText(String(n), w / 2, h * 0.44 + 17); ctx.restore();
}

function drawWinner(ctx, state, w, h) {
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.84)'; ctx.fillRect(w / 2 - 160, h / 2 - 38, 320, 76);
  ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.fillText(`${state.winner} wins`, w / 2, h / 2 + 10); ctx.restore();
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
