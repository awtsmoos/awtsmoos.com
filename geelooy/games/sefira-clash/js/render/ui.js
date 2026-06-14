/**
 * B"H
 * Cut-down mobile HUD.
 *
 * Chapter 158: the battlefield is no longer framed by menus. On mobile, only a
 * thin top strip remains; everything else becomes a whisper unless it matters.
 */
export function drawUi(ctx, state, w, h = innerHeight) {
  const mobile = w < 760;
  if (mobile) drawMobileTopStrip(ctx, state, w);
  else drawDesktopHud(ctx, state.fighters, w, h);
  drawOffscreenFighterBeacons(ctx, state, w, h, mobile);
  drawRespawnCountdown(ctx, state, w, h);
  if (state.debug) drawDebug(ctx, state, w);
  if (state.winner) drawWinner(ctx, state, w, h);
}

function drawMobileTopStrip(ctx, state, w) {
  const fighters = state.fighters.slice(0, 5);
  const h = 28;
  ctx.save();
  ctx.globalAlpha = 0.76;
  ctx.fillStyle = 'rgba(4,3,10,.44)';
  ctx.strokeStyle = 'rgba(255,218,120,.22)';
  roundRect(ctx, 7, 8, w - 14, h, 10);
  ctx.fill();
  ctx.stroke();
  const slot = (w - 24) / Math.max(1, fighters.length);
  fighters.forEach((f, i) => drawTopSlot(ctx, f, 12 + i * slot, 12, slot - 4));
  ctx.restore();
}

function drawTopSlot(ctx, f, x, y, width) {
  const color = hue(f);
  ctx.save();
  ctx.globalAlpha = f.human ? 1 : 0.82;
  ctx.fillStyle = f.human ? '#69ffff' : color;
  ctx.font = '950 8px system-ui';
  ctx.fillText(f.human ? 'YOU' : f.name.replace('Bot ', 'B'), x, y + 8);
  ctx.font = '950 14px system-ui';
  const pct = Math.round(f.damage);
  ctx.fillStyle = pct >= 120 ? '#ff866b' : pct >= 70 ? '#ffe27a' : '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5;
  const text = f.dead ? 'OUT' : `${pct}`;
  ctx.strokeText(text, x, y + 23);
  ctx.fillText(text, x, y + 23);
  drawLights(ctx, f, x + Math.min(width - 18, 34), y + 21, 5, 1.8, color);
  ctx.restore();
}

function drawDesktopHud(ctx, fighters, w, h) {
  const cardW = 96;
  const total = fighters.length * cardW + 14;
  const x0 = (w - total) / 2;
  const y = h - 82;
  ctx.save();
  ctx.fillStyle = 'rgba(4,3,10,.62)';
  ctx.strokeStyle = 'rgba(255,218,120,.45)';
  roundRect(ctx, x0, y, total, 58, 14);
  ctx.fill();
  ctx.stroke();
  fighters.forEach((f, i) => drawDesktopCard(ctx, f, x0 + 8 + i * cardW, y + 7));
  ctx.restore();
}

function drawDesktopCard(ctx, f, x, y) {
  const color = hue(f);
  ctx.font = '950 12px system-ui';
  ctx.fillStyle = f.human ? '#69ffff' : color;
  ctx.fillText(f.human ? 'YOU' : f.name.replace('Bot ', 'B'), x, y + 12);
  drawDesktopPercent(ctx, f, x, y + 39, 23);
  drawLights(ctx, f, x, y + 50, 11, 4, color);
}

function drawDesktopPercent(ctx, f, x, y, size) {
  const pct = Math.round(f.damage);
  ctx.font = `950 ${size}px system-ui`;
  ctx.fillStyle = f.dead ? '#777' : pct >= 120 ? '#ff866b' : pct >= 70 ? '#ffe27a' : '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(3, size * 0.16);
  const text = f.dead ? 'OUT' : f.respawnTimer ? `${Math.ceil(f.respawnTimer / 30)}` : `${pct}%`;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function drawLights(ctx, f, x, y, gap, r, color) {
  const n = Math.max(0, f.stocks || 0);
  for (let i = 0; i < Math.max(3, n); i++) {
    ctx.globalAlpha = i < n ? 1 : 0.15;
    ctx.fillStyle = i < n ? color : '#fff';
    ctx.beginPath();
    ctx.arc(x + i * gap, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawOffscreenFighterBeacons(ctx, state, w, h, mobile) {
  if (!state.camera) return;
  const topSafe = mobile ? 44 : 82;
  const bottomSafe = h - (mobile ? 82 : 96);
  const placed = [];
  for (const f of state.fighters) {
    if (!f || f.dead || f.hidden || (f.human && !state.camera.spectating)) continue;
    const s = worldToScreen(f, state.camera, w, h);
    if (s.x > 18 && s.x < w - 18 && s.y > topSafe && s.y < bottomSafe) continue;
    const p = slot(clamp(s.x, 18, w - 18), clamp(s.y, topSafe, bottomSafe), placed, mobile);
    drawBeacon(ctx, p.x, p.y, Math.atan2(s.y - p.y, s.x - p.x), hue(f), mobile);
  }
}

function drawBeacon(ctx, x, y, angle, color, mobile) {
  ctx.save();
  ctx.globalAlpha = mobile ? 0.32 : 0.7;
  ctx.strokeStyle = color;
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.lineWidth = mobile ? 1.2 : 2.2;
  const bw = mobile ? 18 : 42;
  const bh = mobile ? 15 : 31;
  roundRect(ctx, x - bw / 2, y - bh / 2, bw, bh, 6);
  ctx.fill();
  ctx.stroke();
  drawArrow(ctx, x, y, angle, color, mobile ? 0.26 : 0.78);
  ctx.restore();
}

function slot(x, y, placed, mobile) {
  const out = { x, y };
  for (const p of placed) if (Math.abs(out.x - p.x) < 24 && Math.abs(out.y - p.y) < 18) out.y += mobile ? 16 : 30;
  placed.push(out);
  return out;
}

function worldToScreen(f, camera, w, h) {
  const z = camera.zoom || 1;
  return { x: w / 2 + z * (f.x + camera.x - w / 2), y: h / 2 + z * (f.y - 95 + camera.y - h / 2) };
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

function drawRespawnCountdown(ctx, state, w, h) {
  const f = state.fighters.find(item => item.human && item.respawnTimer > 0 && !item.dead);
  if (!f) return;
  const n = Math.max(1, Math.ceil(f.respawnTimer / 30));
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.44, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '950 48px system-ui';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff2a8';
  ctx.fillText(String(n), w / 2, h * 0.44 + 17);
  ctx.restore();
}

function drawDebug(ctx, state, w) { ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(w - 236, 82, 222, 154); ctx.fillStyle = '#fff4c4'; ctx.font = '12px monospace'; ctx.fillText(`frame ${state.frame}`, w - 224, 104); }
function drawWinner(ctx, state, w, h) { ctx.fillStyle = 'rgba(0,0,0,.84)'; roundRect(ctx, w / 2 - 160, h / 2 - 38, 320, 76, 18); ctx.fill(); ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.fillText(`${state.winner} wins`, w / 2, h / 2 + 10); ctx.textAlign = 'left'; }
function hue(f) { return `hsl(${f.dna.hue} 90% 60%)`; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); }
