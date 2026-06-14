/**
 * B"H
 * Minimal mobile HUD.
 *
 * Chapter 119: on a phone, the battlefield is the altar. The HUD becomes tiny:
 * human status, small bot dots, small beacons. Nothing heavy sits on the fight.
 */
export function drawUi(ctx, state, w, h = innerHeight) {
  const mobile = w < 760;
  if (mobile) drawMobileHud(ctx, state, w, h);
  else drawBottomHud(ctx, state.fighters, w, h);
  drawOffscreenFighterBeacons(ctx, state, w, h, mobile);
  drawRespawnCountdown(ctx, state, w, h);
  drawSpectatorNotice(ctx, state, w, h, mobile);
  if (!mobile) drawMiniTitle(ctx, w, h);
  if (state.debug) drawDebug(ctx, state, w);
  if (state.winner) drawWinner(ctx, state, w, h);
}

function drawMobileHud(ctx, state, w, h) {
  const hero = state.fighters.find(f => f.human) || state.fighters[0];
  if (!hero) return;
  const y = h - 120;
  drawTinyCard(ctx, hero, 10, y, 92, true);
  let x = 110;
  for (const bot of state.fighters.filter(f => !f.human).slice(0, 4)) {
    drawBotChip(ctx, bot, x, y + 18);
    x += 42;
  }
}

function drawTinyCard(ctx, f, x, y, w, hero = false) {
  const color = `hsl(${f.dna.hue} 90% 60%)`;
  ctx.save();
  ctx.fillStyle = 'rgba(4,3,10,.58)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, 38, 11);
  ctx.fill();
  ctx.stroke();
  ctx.font = '950 9px system-ui';
  ctx.fillStyle = hero ? '#69ffff' : color;
  ctx.fillText(hero ? 'YOU' : f.name.replace('Bot ', 'B'), x + 8, y + 13);
  drawPercent(ctx, f, Math.round(f.damage), x + 8, y + 32, true);
  drawLights(ctx, f, x + 53, y + 30, true, color);
  ctx.restore();
}

function drawBotChip(ctx, f, x, y) {
  const color = `hsl(${f.dna.hue} 90% 60%)`;
  ctx.save();
  ctx.fillStyle = 'rgba(4,3,10,.44)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, 34, 22, 8);
  ctx.fill();
  ctx.stroke();
  ctx.font = '900 10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillStyle = Math.round(f.damage) >= 120 ? '#ff866b' : '#fff';
  ctx.fillText(String(Math.round(f.damage)), x + 17, y + 15);
  ctx.restore();
}

function drawBottomHud(ctx, fighters, w, h) {
  const cardW = 112;
  const totalW = Math.min(w - 170, fighters.length * cardW + 18);
  const x0 = Math.max(10, (w - totalW) / 2);
  const y = h - 82;
  ctx.save();
  ctx.fillStyle = 'rgba(4,3,10,.68)';
  ctx.strokeStyle = 'rgba(255,218,120,.55)';
  roundRect(ctx, x0, y, totalW, 64, 14);
  ctx.fill();
  ctx.stroke();
  fighters.forEach((f, i) => drawDamageCard(ctx, f, x0 + 9 + i * cardW, y + 8, cardW - 14));
  ctx.restore();
}

function drawDamageCard(ctx, f, x, y, width) {
  const color = `hsl(${f.dna.hue} 90% 60%)`;
  ctx.font = '950 13px system-ui';
  ctx.fillStyle = f.human ? '#69ffff' : color;
  ctx.fillText(f.human ? 'YOU' : f.name.replace('Bot ', 'B'), x, y + 12);
  drawPercent(ctx, f, Math.round(f.damage), x, y + 42, false);
  drawLights(ctx, f, x, y + 53, false, color);
}

function drawPercent(ctx, f, pct, x, y, mobile) {
  ctx.font = `950 ${mobile ? 17 : 25}px system-ui`;
  ctx.fillStyle = f.dead ? '#777' : pct >= 120 ? '#ff866b' : pct >= 70 ? '#ffe27a' : '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = mobile ? 3 : 4;
  const text = f.dead ? 'OUT' : f.respawnTimer ? `${Math.ceil(f.respawnTimer / 30)}` : `${pct}%`;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function drawLights(ctx, f, x, y, mobile, color) {
  const n = Math.max(0, f.stocks || 0);
  for (let i = 0; i < Math.max(3, n); i++) {
    ctx.globalAlpha = i < n ? 1 : 0.15;
    ctx.fillStyle = i < n ? color : '#fff';
    ctx.beginPath();
    ctx.arc(x + i * (mobile ? 7 : 12), y, mobile ? 2.3 : 4.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawOffscreenFighterBeacons(ctx, state, w, h, mobile) {
  if (!state.camera) return;
  const topSafe = mobile ? 84 : 76;
  const bottomSafe = h - (mobile ? 146 : 96);
  const placed = [];
  for (const f of state.fighters) {
    if (!f || f.dead || f.hidden || (f.human && !state.camera.spectating)) continue;
    const point = worldToScreen(f, state.camera, w, h);
    if (point.x > 18 && point.x < w - 18 && point.y > topSafe && point.y < bottomSafe) continue;
    const p = beaconSlot(clamp(point.x, 24, w - 24), clamp(point.y, topSafe, bottomSafe), placed, mobile);
    drawBeacon(ctx, f, p.x, p.y, point, mobile);
  }
}

function beaconSlot(x, y, placed, mobile) {
  let out = { x, y };
  for (const p of placed) if (Math.abs(out.x - p.x) < 42 && Math.abs(out.y - p.y) < 32) out.y += mobile ? 28 : 40;
  placed.push(out);
  return out;
}

function worldToScreen(f, camera, w, h) {
  const z = camera.zoom || 1;
  return { x: w / 2 + z * (f.x + camera.x - w / 2), y: h / 2 + z * (f.y - 95 + camera.y - h / 2) };
}

function drawBeacon(ctx, f, x, y, point, mobile) {
  const color = `hsl(${f.dna.hue} 90% 62%)`;
  const angle = Math.atan2(point.y - y, point.x - x);
  ctx.save();
  ctx.globalAlpha = 0.84;
  ctx.fillStyle = 'rgba(0,0,0,.54)';
  ctx.strokeStyle = color;
  ctx.lineWidth = mobile ? 2 : 3;
  const bw = mobile ? 30 : 54;
  const bh = mobile ? 24 : 40;
  roundRect(ctx, x - bw / 2, y - bh / 2, bw, bh, 8);
  ctx.fill();
  ctx.stroke();
  drawArrow(ctx, x, y, angle, color, mobile ? 0.52 : 1);
  if (!mobile) {
    ctx.font = '900 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff7c9';
    ctx.fillText(`${Math.round(f.damage)}%`, x, y + 30);
  }
  ctx.restore();
}

function drawArrow(ctx, x, y, angle, color, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(14 * s, 0);
  ctx.lineTo(-7 * s, -10 * s);
  ctx.lineTo(-3 * s, 0);
  ctx.lineTo(-7 * s, 10 * s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRespawnCountdown(ctx, state, w, h) { const f = state.fighters.find(item => item.human && item.respawnTimer > 0 && !item.dead); if (!f) return; const n = Math.max(1, Math.ceil(f.respawnTimer / 30)); ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.58)'; ctx.beginPath(); ctx.arc(w / 2, h * 0.44, 62, 0, Math.PI * 2); ctx.fill(); ctx.font = '950 52px system-ui'; ctx.textAlign = 'center'; ctx.strokeStyle = '#000'; ctx.lineWidth = 7; ctx.strokeText(String(n), w / 2, h * 0.44 + 18); ctx.fillStyle = '#fff2a8'; ctx.fillText(String(n), w / 2, h * 0.44 + 18); ctx.restore(); }
function drawSpectatorNotice(ctx, state, w, h, mobile) { const hero = state.fighters.find(f => f.human); if (!hero || !hero.dead || state.winner) return; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.52)'; roundRect(ctx, w / 2 - 118, h - (mobile ? 166 : 150), 236, 42, 14); ctx.fill(); ctx.textAlign = 'center'; ctx.font = '900 15px system-ui'; ctx.fillStyle = '#fff1a6'; ctx.fillText('SPECTATING THE BOTS', w / 2, h - (mobile ? 140 : 124)); ctx.restore(); }
function drawMiniTitle(ctx, w, h) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.42)'; roundRect(ctx, w / 2 - 105, h - 120, 210, 32, 10); ctx.fill(); ctx.textAlign = 'center'; ctx.font = '900 16px system-ui'; ctx.fillStyle = '#ffe9a8'; ctx.fillText('Sefira Clash', w / 2, h - 99); ctx.restore(); }
function drawDebug(ctx, state, w) { ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(w - 236, 82, 222, 154); ctx.fillStyle = '#fff4c4'; ctx.font = '12px monospace'; ctx.fillText(`phase ${state.phase}`, w - 224, 104); ctx.fillText(`frame ${state.frame}`, w - 224, 124); ctx.fillText(`particles ${state.particles.length}`, w - 224, 144); }
function drawWinner(ctx, state, w, h) { ctx.fillStyle = 'rgba(0,0,0,.84)'; roundRect(ctx, w / 2 - 160, h / 2 - 38, 320, 76, 18); ctx.fill(); ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.fillText(`${state.winner} wins`, w / 2, h / 2 + 10); ctx.textAlign = 'left'; }
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
