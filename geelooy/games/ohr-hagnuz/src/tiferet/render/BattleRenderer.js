/**
 * B"H
 * @module BattleRenderer
 */
import { State } from '../../binah/State.js';
import { resolveStats } from '../../yesod/equipment/EquipmentRuntime.js';
import { drawBar, drawPanel } from './BattleBars.js';
import { drawOpponentGlyph, drawPlayerGlyph } from './BattleGlyphs.js';
import { drawBattleEffects } from './BattleEffects.js';
import { statusLine } from '../../yesod/battle/BattleStatus.js';
import { statusLine } from '../../yesod/battle/BattleStatus.js';

const lightRatio = (value, max) => max ? value / max : 0;

const drawBackdrop = (ctx) => {
  const g = ctx.createLinearGradient(0, 110, 800, 590);
  g.addColorStop(0, 'rgba(7,10,35,.96)');
  g.addColorStop(.55, 'rgba(42,18,66,.96)');
  g.addColorStop(1, 'rgba(7,40,44,.94)');
  ctx.fillStyle = g;
  ctx.fillRect(18, 104, 764, 490);

  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  for (let i = 0; i < 18; i++) {
    const y = 130 + i * 25 + Math.sin((performance.now() / 600) + i) * 3;
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(770, y + Math.sin(i) * 12);
    ctx.stroke();
  }
};

const drawStatsPanel = (ctx, stats) => {
  drawPanel(ctx, 34, 396, 730, 176, 'Choose Torah Response');
  ctx.fillStyle = '#d7ccc8';
  ctx.font = '13px monospace';
  ctx.fillText(`Level ${State.Stats.level} | EXP ${State.Stats.exp}/${State.Stats.nextExp} | Sparks ${State.Stats.sparks}`, 52, 424);
  drawBar(ctx, 52, 438, 270, 18, State.Stats.exp / State.Stats.nextExp, 'EXP', '#29b6f6');

  State.Debate.moves.forEach((move, i) => {
    const x = i < 2 ? 52 : 410;
    const y = 472 + (i % 2) * 42;
    ctx.fillStyle = i === State.Debate.cursor ? 'rgba(255,235,59,.32)' : 'rgba(255,255,255,.10)';
    ctx.fillRect(x, y - 24, 312, 34);
    ctx.strokeStyle = i === State.Debate.cursor ? '#fff176' : 'rgba(255,255,255,.16)';
    ctx.strokeRect(x, y - 24, 312, 34);
    ctx.fillStyle = '#fffde7';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`${i + 1}. ${move.name}`, x + 12, y - 2);
  });
};

const drawLog = (ctx) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.fillRect(260, 238, 500, 122);
  ctx.strokeStyle = 'rgba(255,255,255,.16)';
  ctx.strokeRect(260, 238, 500, 122);
  ctx.font = '13px monospace';
  ctx.fillStyle = '#e1bee7';
  State.Debate.log.slice(0, 4).forEach((line, i) => {
    const clipped = line.length > 72 ? line.slice(0, 69) + '...' : line;
    ctx.fillText(clipped, 274, 262 + i * 24);
  });
  ctx.restore();
};

export const renderBattle = (ctx) => {
  const D = State.Debate;
  const stats = resolveStats();
  ctx.save();
  drawBackdrop(ctx);

  drawPanel(ctx, 420, 126, 330, 98, D.enemy?.name || 'Opponent');
  drawBar(ctx, 442, 166, 260, 20, lightRatio(D.enemyLight, D.enemyMaxLight), `LIGHT ${D.enemyLight}/${D.enemyMaxLight}`, '#ef5350');
  ctx.fillStyle = '#e1bee7';
  ctx.font = '13px monospace';
  ctx.fillText(`Glyph ${D.enemy?.glyph || '?'} | ${D.rank?.label || 'Debate Pressure'}`, 442, 206);
  drawOpponentGlyph(ctx, D.enemy?.glyph, 585, 300, 128);

  drawPanel(ctx, 42, 254, 330, 116, 'Player Vessel');
  drawBar(ctx, 64, 296, 260, 20, lightRatio(State.Stats.light, State.Stats.maxLight), `LIGHT ${State.Stats.light}/${State.Stats.maxLight}`, '#66bb6a');
  ctx.fillStyle = '#bbdefb';
  ctx.font = '13px monospace';
  ctx.fillText(`Chochmah ${stats.chochmah} | Binah ${stats.binah} | Daat ${stats.daat}`, 64, 336);
  ctx.fillStyle = '#f8bbd0';
  ctx.fillText(statusLine(), 64, 354);
  ctx.fillStyle = '#f8bbd0';
  ctx.fillText(statusLine(), 64, 354);
  drawPlayerGlyph(ctx, stats, 166, 224, 108);

  drawLog(ctx);
  drawStatsPanel(ctx, stats);
  drawBattleEffects(ctx);

  ctx.fillStyle = '#b2dfdb';
  ctx.font = '12px monospace';
  ctx.fillText('Click a move, press 1-4, or use arrows + Enter/Z. Esc/X withdraws.', 56, 562);
  ctx.restore();
};
