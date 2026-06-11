import { panel, bar } from './ui/panels.js';

/**
 * B"H — HUD upgraded toward the reference: top stock strip, black/gold debug
 * panels, and winner overlay. It stays compact on mobile and clean on desktop.
 */
export function drawUi(ctx, state, w) {
  drawStockStrip(ctx, state.fighters);
  if (state.debug) drawDebug(ctx, state);
  if (state.winner) drawWinner(ctx, state, w);
}

function drawStockStrip(ctx, fighters) {
  let x = 18;
  for (const f of fighters) {
    if (f.dead) continue;
    const color = `hsl(${f.dna.hue} 90% 60%)`;
    ctx.font = 'bold 12px system-ui';
    ctx.fillStyle = '#0008';
    ctx.fillRect(x - 7, 88, 120, 34);
    ctx.fillStyle = color;
    ctx.fillText(f.human ? 'YOU' : f.name.slice(0, 10), x, 102);
    bar(ctx, x, 108, 78, Math.max(0, 1 - f.damage / 180), color);
    ctx.fillStyle = '#fff7c9';
    ctx.fillText(`${Math.round(f.damage)}% S${f.stocks}`, x + 82, 113);
    x += 132;
  }
}

function drawDebug(ctx, state) {
  panel(ctx, 12, 132, 220, 94, 'SYSTEMS');
  ctx.fillStyle = '#fff4c4';
  ctx.font = '12px monospace';
  ctx.fillText(`frame: ${state.frame}`, 24, 158);
  ctx.fillText(`fighters: ${state.fighters.length}`, 24, 178);
  ctx.fillText(`weapons: ${state.weapons.length}`, 24, 198);
  ctx.fillText(`particles: ${state.particles.length}`, 24, 218);
}

function drawWinner(ctx, state, w) {
  ctx.fillStyle = 'rgba(0,0,0,.82)';
  ctx.fillRect(0, 138, w, 76);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 28px system-ui';
  ctx.fillText(`${state.winner} stands alone`, 24, 185);
}
