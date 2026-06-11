import { bar } from './ui/panels.js';

/**
 * B"H
 * Clean battle HUD.
 *
 * The right-side debug dashboard is gone from live combat. The player sees a
 * slim top strip, key hints, and optional debug only. Less clutter, more fight.
 */
export function drawUi(ctx, state, w) {
  drawTopHud(ctx, state.fighters, w);
  drawControlHint(ctx, w);
  if (state.debug) drawDebug(ctx, state, w);
  if (state.winner) drawWinner(ctx, state, w);
}

function drawTopHud(ctx, fighters, w) {
  ctx.fillStyle = 'rgba(0,0,0,.58)';
  ctx.fillRect(0, 74, w, 44);
  let x = 14;
  for (const f of fighters) {
    if (f.dead) continue;
    const color = `hsl(${f.dna.hue} 90% 60%)`;
    const hp = Math.max(0, 1 - f.damage / 180);
    ctx.font = 'bold 11px system-ui';
    ctx.fillStyle = color;
    ctx.fillText(f.human ? 'YOU' : f.name.slice(0, 8), x, 91);
    bar(ctx, x, 98, 86, hp, color);
    ctx.fillStyle = '#fff7c9';
    ctx.fillText(`${Math.round(100 * hp)} S${f.stocks}`, x + 88, 104);
    x += 132;
  }
}

function drawControlHint(ctx, w) {
  if (w < 820) return;
  ctx.fillStyle = 'rgba(0,0,0,.48)';
  ctx.fillRect(18, 126, 520, 24);
  ctx.fillStyle = '#fff1bd';
  ctx.font = '11px system-ui';
  ctx.fillText('A/D move · W/Space jump · hold/release F punch · hold/release G kick · H grab · Shift shield · R special', 30, 142);
}

function drawDebug(ctx, state, w) {
  ctx.fillStyle = 'rgba(0,0,0,.7)';
  ctx.fillRect(w - 190, 124, 176, 80);
  ctx.fillStyle = '#fff4c4';
  ctx.font = '12px monospace';
  ctx.fillText(`phase ${state.phase}`, w - 176, 148);
  ctx.fillText(`frame ${state.frame}`, w - 176, 168);
  ctx.fillText(`particles ${state.particles.length}`, w - 176, 188);
}

function drawWinner(ctx, state, w) {
  ctx.fillStyle = 'rgba(0,0,0,.84)';
  ctx.fillRect(0, 150, w, 84);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 30px system-ui';
  ctx.fillText(`${state.winner} wins the match`, 24, 199);
}
