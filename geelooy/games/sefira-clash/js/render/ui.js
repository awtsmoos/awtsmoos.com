/**
 * B"H
 * Bottom-anchored desktop HUD.
 *
 * Chapter 250: the upper sky is returned to the fight. The fighter cards descend
 * into a compact altar at the bottom center, where percent and lights remain
 * readable without choking the arena. The Awtsmoos reveals order inside the UI.
 */
export function drawUi(ctx, state, w, h = innerHeight) {
  drawBottomHud(ctx, state.fighters, w, h);
  drawOffscreenFighterBeacons(ctx, state, w, h);
  drawRespawnCountdown(ctx, state, w, h);
  drawSpectatorNotice(ctx, state, w, h);
  drawMiniTitle(ctx, w, h);
  if (state.debug) drawDebug(ctx, state, w);
  if (state.winner) drawWinner(ctx, state, w, h);
}

function drawBottomHud(ctx, fighters, w, h) {
  const compact = w < 820;
  const cardW = compact ? Math.max(72, Math.min(104, (w - 24) / fighters.length)) : 112;
  const totalW = Math.min(w - 170, fighters.length * cardW + 18);
  const x0 = Math.max(10, (w - totalW) / 2);
  const y = h - (compact ? 68 : 82);
  ctx.save();
  ctx.fillStyle = 'rgba(4,3,10,.68)';
  ctx.strokeStyle = 'rgba(255,218,120,.55)';
  ctx.lineWidth = 1.2;
  roundRect(ctx, x0, y, totalW, compact ? 54 : 64, 14);
  ctx.fill();
  ctx.stroke();
  drawCards(ctx, fighters, x0 + 9, y + 8, cardW, compact);
  ctx.restore();
}

function drawCards(ctx, fighters, x, y, cardW, compact) {
  for (let i = 0; i < fighters.length; i++) {
    const f = fighters[i];
    const cx = x + i * cardW;
    if (i > 0) divider(ctx, cx - 8, y + 4, compact ? 34 : 44);
    drawDamageCard(ctx, f, cx, y, cardW - 14, compact);
  }
}

function divider(ctx, x, y, h) {
  ctx.strokeStyle = 'rgba(255,255,255,.24)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.stroke();
}

function drawDamageCard(ctx, f, x, y, width, compact) {
  const color = `hsl(${f.dna.hue} 90% 60%)`;
  const pct = Math.round(f.damage);
  ctx.globalAlpha = f.hidden ? 0.55 : 1;
  ctx.font = `950 ${compact ? 11 : 13}px system-ui`;
  ctx.fillStyle = f.human ? '#69ffff' : color;
  ctx.fillText(f.human ? 'YOU' : f.name.replace('Bot ', 'B'), x, y + 12);
  drawPercent(ctx, f, pct, x, y + (compact ? 35 : 42), compact);
  drawLights(ctx, f, x, y + (compact ? 45 : 53), compact, color);
  ctx.globalAlpha = 1;
}

function drawPercent(ctx, f, pct, x, y, compact) {
  ctx.font = `950 ${compact ? 20 : 25}px system-ui`;
  const danger = pct >= 120;
  ctx.fillStyle = f.dead ? '#777' : danger ? '#ff866b' : pct >= 70 ? '#ffe27a' : '#ffffff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  const text = f.dead ? 'OUT' : f.respawnTimer ? `${Math.ceil(f.respawnTimer / 30)}` : `${pct}%`;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function drawLights(ctx, f, x, y, compact, color) {
  const n = Math.max(0, f.stocks || 0);
  const gap = compact ? 10 : 12;
  for (let i = 0; i < Math.max(3, n); i++) {
    ctx.globalAlpha = i < n ? 1 : 0.16;
    ctx.fillStyle = i < n ? color : '#ffffff';
    ctx.beginPath();
    ctx.arc(x + i * gap + 4, y, compact ? 3.4 : 4.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.font = `900 ${compact ? 9 : 11}px system-ui`;
  ctx.fillStyle = '#fff7c9';
  ctx.fillText(`×${n}`, x + gap * 3 + 4, y + 4);
}

function drawMiniTitle(ctx, w, h) {
  if (w < 900) return;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.42)';
  roundRect(ctx, w / 2 - 105, h - 120, 210, 32, 10);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.font = '900 16px system-ui';
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText('Sefira Clash', w / 2, h - 99);
  ctx.restore();
}

function drawRespawnCountdown(ctx, state, w, h) {
  const f = state.fighters.find(item => item.human && item.respawnTimer > 0 && !item.dead);
  if (!f) return;
  const n = Math.max(1, Math.ceil(f.respawnTimer / 30));
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.58)';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.44, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '950 52px system-ui';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 7;
  ctx.strokeText(String(n), w / 2, h * 0.44 + 18);
  ctx.fillStyle = '#fff2a8';
  ctx.fillText(String(n), w / 2, h * 0.44 + 18);
  ctx.restore();
}

function drawSpectatorNotice(ctx, state, w, h) {
  const hero = state.fighters.find(f => f.human);
  if (!hero || !hero.dead || state.winner) return;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.52)';
  roundRect(ctx, w / 2 - 118, h - 150, 236, 42, 14);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.font = '900 15px system-ui';
  ctx.fillStyle = '#fff1a6';
  ctx.fillText('SPECTATING THE BOTS', w / 2, h - 124);
  ctx.restore();
}

function drawOffscreenFighterBeacons(ctx, state, w, h) {
  if (!state.camera) return;
  const margin = 34;
  const topSafe = 76;
  const bottomSafe = h - 96;
  for (const f of state.fighters) {
    if (!f || f.dead || f.hidden || (f.human && !state.camera.spectating)) continue;
    const point = worldToScreen(f, state.camera, w, h);
    if (point.x > 18 && point.x < w - 18 && point.y > topSafe && point.y < bottomSafe) continue;
    drawBeacon(ctx, f, clamp(point.x, margin, w - margin), clamp(point.y, topSafe, bottomSafe), point, h);
  }
}

function worldToScreen(f, camera, w, h) {
  const zoom = camera.zoom || 1;
  return { x: w / 2 + zoom * (f.x + camera.x - w / 2), y: h / 2 + zoom * (f.y - 95 + camera.y - h / 2) };
}

function drawBeacon(ctx, f, x, y, point, h) {
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

function drawDebug(ctx, state, w) {
  ctx.fillStyle = 'rgba(0,0,0,.7)';
  ctx.fillRect(w - 236, 82, 222, 154);
  ctx.fillStyle = '#fff4c4';
  ctx.font = '12px monospace';
  ctx.fillText(`phase ${state.phase}`, w - 224, 104);
  ctx.fillText(`frame ${state.frame}`, w - 224, 124);
  ctx.fillText(`particles ${state.particles.length}`, w - 224, 144);
  const bot = state.fighters.find(f => !f.human && !f.dead && f.aiMind?.debug);
  if (bot) ctx.fillText(`${bot.aiMind.debug.koIntent}/${bot.aiMind.debug.attackFamily}`, w - 224, 164);
}

function drawWinner(ctx, state, w, h) {
  ctx.fillStyle = 'rgba(0,0,0,.84)';
  roundRect(ctx, w / 2 - 160, h / 2 - 38, 320, 76, 18);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 28px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`${state.winner} wins`, w / 2, h / 2 + 10);
  ctx.textAlign = 'left';
}

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
