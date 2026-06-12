import { bar } from './ui/panels.js';

/**
 * B"H
 * Compact match HUD with respawn countdown and offscreen beacons.
 *
 * Chapter 23: no fighter may vanish from the top scroll. The cards shrink into
 * rows when the screen is narrow, and the human respawn countdown burns over
 * the arena after the KO burst has had time to speak.
 */
export function drawUi(ctx, state, w, h = innerHeight) {
  drawTopHud(ctx, state.fighters, w);
  drawOffscreenFighterBeacons(ctx, state, w, h);
  drawRespawnCountdown(ctx, state, w, h);
  if (w >= 920) drawControlHint(ctx, w);
  if (state.debug) drawDebug(ctx, state, w);
  if (state.winner) drawWinner(ctx, state, w);
}

function drawTopHud(ctx, fighters, w) {
  const compact = w < 820;
  const cardW = compact ? Math.max(66, Math.min(108, (w - 16) / Math.max(1, fighters.length))) : 150;
  const rows = compact && fighters.length * cardW > w - 12 ? 2 : 1;
  ctx.fillStyle = 'rgba(0,0,0,.50)';
  ctx.fillRect(0, compact ? 54 : 66, w, compact ? 45 * rows + 8 : 68);
  drawFighterRows(ctx, fighters, w, compact, cardW, rows);
}

function drawFighterRows(ctx, fighters, w, compact, cardW, rows) {
  const startY = compact ? 61 : 76;
  const perRow = Math.max(1, Math.floor((w - 10) / cardW));
  for (let i = 0; i < fighters.length; i++) {
    const row = rows > 1 ? Math.floor(i / perRow) : 0;
    const col = rows > 1 ? i % perRow : i;
    const x = 6 + col * cardW;
    const y = startY + row * 43;
    if (y > startY + 45) break;
    drawDamageCard(ctx, fighters[i], x, y, cardW - 5, compact);
  }
}

function drawDamageCard(ctx, f, x, y, width, compact) {
  const color = `hsl(${f.dna.hue} 90% 60%)`;
  const pct = Math.round(f.damage);
  const danger = pct >= 120;
  const label = f.human ? 'YOU' : f.name.replace('Bot ', 'B');
  ctx.fillStyle = f.dead ? 'rgba(0,0,0,.22)' : 'rgba(0,0,0,.42)';
  roundRect(ctx, x, y, width, compact ? 36 : 48, 9);
  ctx.fill();
  ctx.globalAlpha = f.hidden ? 0.55 : 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + 9, y + 12, compact ? 5 : 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `900 ${compact ? 9 : 12}px system-ui`;
  ctx.fillStyle = f.human ? '#8ffcff' : '#fff7c9';
  ctx.fillText(label, x + 18, y + 14);
  ctx.font = `950 ${compact ? 16 : 24}px system-ui`;
  ctx.fillStyle = danger ? '#ff866b' : pct >= 70 ? '#ffe27a' : '#ffffff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  const text = f.respawnTimer ? `${Math.ceil(f.respawnTimer / 30)}` : `${pct}%`;
  ctx.strokeText(text, x + 9, y + (compact ? 33 : 41));
  ctx.fillText(text, x + 9, y + (compact ? 33 : 41));
  ctx.font = `900 ${compact ? 9 : 12}px system-ui`;
  ctx.fillStyle = '#fff7c9';
  ctx.fillText(`S${f.stocks}`, x + width - 25, y + (compact ? 33 : 41));
  if (!f.respawnTimer) bar(ctx, x + 18, y + 18, Math.max(18, width - 40), Math.max(0.08, Math.min(1, pct / 180)), color);
  ctx.globalAlpha = 1;
}

function drawRespawnCountdown(ctx, state, w, h) {
  const f = state.fighters.find(item => item.human && item.respawnTimer > 0 && !item.dead);
  if (!f) return;
  const n = Math.max(1, Math.ceil(f.respawnTimer / 30));
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.58)';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.42, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '950 52px system-ui';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 7;
  ctx.strokeText(String(n), w / 2, h * 0.42 + 18);
  ctx.fillStyle = '#fff2a8';
  ctx.fillText(String(n), w / 2, h * 0.42 + 18);
  ctx.font = '900 13px system-ui';
  ctx.fillText('RESPAWN', w / 2, h * 0.42 + 44);
  ctx.restore();
}

function drawOffscreenFighterBeacons(ctx, state, w, h) {
  if (!state.camera) return;
  const margin = 34;
  const topHud = w < 820 ? 145 : 136;
  for (const f of state.fighters) {
    if (!f || f.dead || f.hidden || f.human) continue;
    const point = worldToScreen(f, state.camera, w, h);
    if (point.x > 18 && point.x < w - 18 && point.y > topHud && point.y < h - 18) continue;
    drawBeacon(ctx, f, clamp(point.x, margin, w - margin), clamp(point.y, topHud + 18, h - margin), point, w, h);
  }
}

function worldToScreen(f, camera, w, h) {
  const zoom = camera.zoom || 1;
  return { x: w / 2 + zoom * (f.x + camera.x - w / 2), y: h / 2 + zoom * (f.y - 95 + camera.y - h / 2) };
}

function drawBeacon(ctx, f, x, y, point, w, h) {
  const color = `hsl(${f.dna.hue} 90% 62%)`;
  const angle = Math.atan2(point.y - y, point.x - x);
  ctx.save();
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = 'rgba(0,0,0,.68)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  roundRect(ctx, x - 25, y - 18, 50, 36, 12);
  ctx.fill();
  ctx.stroke();
  drawArrow(ctx, x, y, angle, color);
  ctx.font = '900 10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff7c9';
  ctx.fillText(`${Math.round(f.damage)}%`, x, y + 29 > h - 4 ? y - 24 : y + 30);
  ctx.restore();
}

function drawArrow(ctx, x, y, angle, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-7, -10); ctx.lineTo(-3, 0); ctx.lineTo(-7, 10); ctx.closePath(); ctx.fill(); ctx.restore();
}

function drawControlHint(ctx) { ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fillRect(18, 146, 360, 22); ctx.fillStyle = '#fff1bd'; ctx.font = '11px system-ui'; ctx.fillText('Move/aim · tap/rapid/hold punch or kick · grab · jump', 30, 161); }
function drawDebug(ctx, state, w) { ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(w - 214, 132, 200, 130); ctx.fillStyle = '#fff4c4'; ctx.font = '12px monospace'; ctx.fillText(`phase ${state.phase}`, w - 202, 154); ctx.fillText(`frame ${state.frame}`, w - 202, 174); ctx.fillText(`particles ${state.particles.length}`, w - 202, 194); ctx.fillText(`fighters ${state.fighters.length}`, w - 202, 214); const bot = state.fighters.find(f => !f.human && !f.dead && f.aiMind?.debug); if (bot) ctx.fillText(`${bot.aiMind.debug.state}/${bot.aiMind.debug.stuck}`, w - 202, 234); if (bot) ctx.fillText(`${bot.aiMind.debug.routeAction} np:${bot.aiMind.debug.noProgress}`, w - 202, 252); }
function drawWinner(ctx, state, w) { ctx.fillStyle = 'rgba(0,0,0,.84)'; ctx.fillRect(0, 150, w, 80); ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 28px system-ui'; ctx.fillText(`${state.winner} wins`, 24, 198); }

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
