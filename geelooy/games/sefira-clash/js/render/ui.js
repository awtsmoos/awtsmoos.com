import { bar } from './ui/panels.js';

/**
 * B"H
 * Compact match HUD with lights, respawn countdown, spectator state, and beacons.
 *
 * Chapter 221: every fighter now shows damage and remaining lights. If the
 * player is eliminated, the HUD does not close the story; it says SPECTATING
 * while the bots continue their war under the wider camera.
 */
export function drawUi(ctx, state, w, h = innerHeight) {
  drawTopHud(ctx, state.fighters, w);
  drawOffscreenFighterBeacons(ctx, state, w, h);
  drawRespawnCountdown(ctx, state, w, h);
  drawSpectatorNotice(ctx, state, w, h);
  if (w >= 920) drawControlHint(ctx, w);
  if (state.debug) drawDebug(ctx, state, w);
  if (state.winner) drawWinner(ctx, state, w);
}

function drawTopHud(ctx, fighters, w) {
  const compact = w < 820;
  const cardW = compact ? Math.max(78, Math.min(118, (w - 16) / Math.max(1, fighters.length))) : 164;
  const rows = compact && fighters.length * cardW > w - 12 ? 2 : 1;
  ctx.fillStyle = 'rgba(0,0,0,.50)';
  ctx.fillRect(0, compact ? 54 : 66, w, compact ? 48 * rows + 8 : 72);
  drawFighterRows(ctx, fighters, w, compact, cardW, rows);
}

function drawFighterRows(ctx, fighters, w, compact, cardW, rows) {
  const startY = compact ? 61 : 76;
  const perRow = Math.max(1, Math.floor((w - 10) / cardW));
  for (let i = 0; i < fighters.length; i++) {
    const row = rows > 1 ? Math.floor(i / perRow) : 0;
    const col = rows > 1 ? i % perRow : i;
    const x = 6 + col * cardW;
    const y = startY + row * 46;
    if (y > startY + 48) break;
    drawDamageCard(ctx, fighters[i], x, y, cardW - 5, compact);
  }
}

function drawDamageCard(ctx, f, x, y, width, compact) {
  const color = `hsl(${f.dna.hue} 90% 60%)`;
  const pct = Math.round(f.damage);
  const danger = pct >= 120;
  const label = f.human ? 'YOU' : f.name.replace('Bot ', 'B');
  ctx.fillStyle = f.dead ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,.42)';
  roundRect(ctx, x, y, width, compact ? 40 : 52, 9);
  ctx.fill();
  ctx.globalAlpha = f.hidden ? 0.55 : 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + 9, y + 12, compact ? 5 : 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `900 ${compact ? 9 : 12}px system-ui`;
  ctx.fillStyle = f.human ? '#8ffcff' : '#fff7c9';
  ctx.fillText(label, x + 18, y + 14);
  drawPercent(ctx, f, pct, danger, x + 9, y + (compact ? 35 : 43), compact);
  drawLights(ctx, f, x + width - (compact ? 42 : 50), y + (compact ? 22 : 25), compact);
  if (!f.respawnTimer && !f.dead) bar(ctx, x + 18, y + 18, Math.max(18, width - 58), Math.max(0.08, Math.min(1, pct / 180)), color);
  ctx.globalAlpha = 1;
}

function drawPercent(ctx, f, pct, danger, x, y, compact) {
  ctx.font = `950 ${compact ? 15 : 23}px system-ui`;
  ctx.fillStyle = f.dead ? '#777' : danger ? '#ff866b' : pct >= 70 ? '#ffe27a' : '#ffffff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  const text = f.dead ? 'OUT' : f.respawnTimer ? `${Math.ceil(f.respawnTimer / 30)}` : `${pct}%`;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function drawLights(ctx, f, x, y, compact) {
  const n = Math.max(0, f.stocks || 0);
  ctx.font = `900 ${compact ? 8 : 10}px system-ui`;
  ctx.fillStyle = '#fff7c9';
  ctx.fillText('LIGHTS', x - 2, y - 8);
  for (let i = 0; i < Math.max(3, n); i++) {
    ctx.globalAlpha = i < n ? 1 : 0.18;
    ctx.fillStyle = i < n ? '#fff1a6' : '#ffffff';
    ctx.beginPath();
    ctx.arc(x + i * (compact ? 9 : 11), y + 5, compact ? 3.4 : 4.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.font = `900 ${compact ? 9 : 12}px system-ui`;
  ctx.fillStyle = '#fff7c9';
  ctx.fillText(`×${n}`, x + (compact ? 31 : 39), y + 9);
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

function drawSpectatorNotice(ctx, state, w, h) {
  const hero = state.fighters.find(f => f.human);
  if (!hero || !hero.dead || state.winner) return;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.48)';
  roundRect(ctx, w / 2 - 118, h - 74, 236, 42, 14);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.font = '900 15px system-ui';
  ctx.fillStyle = '#fff1a6';
  ctx.fillText('SPECTATING THE BOTS', w / 2, h - 48);
  ctx.font = '800 10px system-ui';
  ctx.fillText('the battle continues until one remains', w / 2, h - 34);
  ctx.restore();
}

function drawOffscreenFighterBeacons(ctx, state, w, h) {
  if (!state.camera) return;
  const margin = 34;
  const topHud = w < 820 ? 152 : 144;
  for (const f of state.fighters) {
    if (!f || f.dead || f.hidden || (f.human && !state.camera.spectating)) continue;
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
  ctx.fillText(`${Math.round(f.damage)}% · ${Math.max(0, f.stocks || 0)}L`, x, y + 29 > h - 4 ? y - 24 : y + 30);
  ctx.restore();
}

function drawArrow(ctx, x, y, angle, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-7, -10); ctx.lineTo(-3, 0); ctx.lineTo(-7, 10); ctx.closePath(); ctx.fill(); ctx.restore();
}

function drawControlHint(ctx) { ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fillRect(18, 146, 360, 22); ctx.fillStyle = '#fff1bd'; ctx.font = '11px system-ui'; ctx.fillText('Move/aim · tap/rapid/hold punch or kick · grab · jump', 30, 161); }
function drawDebug(ctx, state, w) { ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(w - 236, 132, 222, 154); ctx.fillStyle = '#fff4c4'; ctx.font = '12px monospace'; ctx.fillText(`phase ${state.phase}`, w - 224, 154); ctx.fillText(`frame ${state.frame}`, w - 224, 174); ctx.fillText(`particles ${state.particles.length}`, w - 224, 194); ctx.fillText(`fighters ${state.fighters.length}`, w - 224, 214); const bot = state.fighters.find(f => !f.human && !f.dead && f.aiMind?.debug); if (bot) ctx.fillText(`${bot.aiMind.debug.state}/${bot.aiMind.debug.stuck}`, w - 224, 234); if (bot) ctx.fillText(`${bot.aiMind.debug.koIntent}/${bot.aiMind.debug.attackFamily}`, w - 224, 252); if (bot) ctx.fillText(`${bot.aiMind.debug.routeAction} np:${bot.aiMind.debug.noProgress}`, w - 224, 270); }
function drawWinner(ctx, state, w) { ctx.fillStyle = 'rgba(0,0,0,.84)'; ctx.fillRect(0, 150, w, 80); ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 28px system-ui'; ctx.fillText(`${state.winner} wins`, 24, 198); }

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
