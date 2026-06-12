import { bar } from './ui/panels.js';

/**
 * B"H
 * Smash-style battle HUD with every fighter's damage percent.
 *
 * Chapter 239: the top of the screen becomes a clear ledger of danger. Every
 * living fighter shows color, name, damage percent, and stocks, so the player
 * can instantly understand who is heavy, who is doomed, and who must be chased.
 */
export function drawUi(ctx, state, w) {
  drawTopHud(ctx, state.fighters, w);
  if (w >= 920) drawControlHint(ctx, w);
  if (state.debug) drawDebug(ctx, state, w);
  if (state.winner) drawWinner(ctx, state, w);
}

function drawTopHud(ctx, fighters, w) {
  const compact = w < 820;
  const h = compact ? 56 : 68;
  ctx.fillStyle = 'rgba(0,0,0,.52)';
  ctx.fillRect(0, compact ? 54 : 66, w, h);
  drawFighterRows(ctx, fighters, w, compact);
}

function drawFighterRows(ctx, fighters, w, compact) {
  const live = fighters.filter(f => !f.dead);
  const cardW = compact ? Math.max(92, Math.min(136, (w - 18) / Math.max(1, live.length))) : 150;
  const startY = compact ? 62 : 76;
  for (let i = 0; i < live.length; i++) {
    const f = live[i];
    const x = 10 + i * cardW;
    if (x > w - 65) break;
    drawDamageCard(ctx, f, x, startY, cardW - 8, compact);
  }
}

function drawDamageCard(ctx, f, x, y, width, compact) {
  const color = `hsl(${f.dna.hue} 90% 60%)`;
  const pct = Math.round(f.damage);
  const danger = pct >= 120;
  const label = f.human ? 'YOU' : f.name.replace('Bot ', 'B');
  ctx.fillStyle = 'rgba(0,0,0,.42)';
  roundRect(ctx, x, y, width, compact ? 38 : 48, 9);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + 10, y + 12, compact ? 5 : 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `900 ${compact ? 10 : 12}px system-ui`;
  ctx.fillStyle = f.human ? '#8ffcff' : '#fff7c9';
  ctx.fillText(label, x + 20, y + 14);
  ctx.font = `950 ${compact ? 17 : 24}px system-ui`;
  ctx.fillStyle = danger ? '#ff866b' : pct >= 70 ? '#ffe27a' : '#ffffff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText(`${pct}%`, x + 10, y + (compact ? 34 : 41));
  ctx.fillText(`${pct}%`, x + 10, y + (compact ? 34 : 41));
  ctx.font = `900 ${compact ? 10 : 12}px system-ui`;
  ctx.fillStyle = '#fff7c9';
  ctx.fillText(`S${f.stocks}`, x + width - 28, y + (compact ? 34 : 41));
  bar(ctx, x + 20, y + 18, width - 42, Math.max(0.08, Math.min(1, pct / 180)), color);
}

function drawControlHint(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.fillRect(18, 146, 360, 22);
  ctx.fillStyle = '#fff1bd';
  ctx.font = '11px system-ui';
  ctx.fillText('Move/aim · tap/rapid/hold punch or kick · grab · jump', 30, 161);
}

function drawDebug(ctx, state, w) {
  ctx.fillStyle = 'rgba(0,0,0,.7)';
  ctx.fillRect(w - 190, 132, 176, 102);
  ctx.fillStyle = '#fff4c4';
  ctx.font = '12px monospace';
  ctx.fillText(`phase ${state.phase}`, w - 178, 154);
  ctx.fillText(`frame ${state.frame}`, w - 178, 174);
  ctx.fillText(`particles ${state.particles.length}`, w - 178, 194);
  ctx.fillText(`fighters ${state.fighters.length}`, w - 178, 214);
}

function drawWinner(ctx, state, w) {
  ctx.fillStyle = 'rgba(0,0,0,.84)';
  ctx.fillRect(0, 150, w, 80);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 28px system-ui';
  ctx.fillText(`${state.winner} wins`, 24, 198);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}
