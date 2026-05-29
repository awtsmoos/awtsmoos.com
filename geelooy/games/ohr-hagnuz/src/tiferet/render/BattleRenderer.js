/**
 * B"H
 * @module BattleRenderer
 *
 * Chapter 15: The Battle Menu Bent Down To The Palm.
 * The Awtsmoos has no body and no form; nevertheless the finite overlay must
 * widen its mercy for mobile glass. The same data now paints and receives taps.
 */
import { State } from '../../binah/State.js';
import { resolveStats } from '../../yesod/equipment/EquipmentRuntime.js';
import { statusLine } from '../../yesod/battle/BattleStatus.js';
import { drawBar, drawPanel } from './BattleBars.js';
import { drawOpponentGlyph, drawPlayerGlyph } from './BattleGlyphs.js';
import { drawBattleEffects } from './BattleEffects.js';
import { battleMoveLayout } from './BattleMoveLayout.js';

const lightRatio = (value, max) => (max ? value / max : 0);
const fit = (text, max = 58) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
const screenWidth = ctx => ctx.canvas.getBoundingClientRect?.().width || ctx.canvas.width;

const drawBackdrop = ctx => {
  const g = ctx.createLinearGradient(0, 0, 800, 600);
  g.addColorStop(0, 'rgba(7,10,35,.98)');
  g.addColorStop(0.56, 'rgba(42,18,66,.98)');
  g.addColorStop(1, 'rgba(7,40,44,.96)');
  ctx.fillStyle = g;
  ctx.fillRect(18, 18, 764, 564);
  ctx.strokeStyle = 'rgba(255,255,255,.14)';
  for (let i = 0; i < 15; i += 1) {
    const y = 48 + i * 31 + Math.sin(performance.now() / 700 + i) * 2;
    ctx.beginPath();
    ctx.moveTo(34, y);
    ctx.lineTo(766, y + Math.sin(i) * 8);
    ctx.stroke();
  }
};

const drawCombatants = (ctx, stats, mobile) => {
  const D = State.Debate;
  drawPanel(ctx, 430, 38, 320, 88, D.enemy?.name || 'Opponent');
  drawBar(ctx, 448, 78, 270, 18, lightRatio(D.enemyLight, D.enemyMaxLight), `LIGHT ${D.enemyLight}/${D.enemyMaxLight}`, '#ef5350');
  ctx.fillStyle = '#e1bee7';
  ctx.font = '12px monospace';
  ctx.fillText(fit(`Glyph ${D.enemy?.glyph || '?'} | ${D.rank?.label || 'Debate Pressure'}`, 42), 448, 114);
  drawOpponentGlyph(ctx, D.enemy?.glyph, 590, mobile ? 190 : 224, mobile ? 88 : 106);

  drawPanel(ctx, 46, mobile ? 188 : 230, 330, 104, 'Player');
  drawBar(ctx, 66, mobile ? 228 : 270, 270, 18, lightRatio(State.Stats.light, State.Stats.maxLight), `LIGHT ${State.Stats.light}/${State.Stats.maxLight}`, '#66bb6a');
  ctx.fillStyle = '#bbdefb';
  ctx.font = '12px monospace';
  ctx.fillText(`Ch ${stats.chochmah} | Bi ${stats.binah} | Da ${stats.daat}`, 66, mobile ? 264 : 306);
  ctx.fillStyle = '#f8bbd0';
  ctx.fillText(fit(statusLine(), 42), 66, mobile ? 280 : 322);
  drawPlayerGlyph(ctx, stats, 172, mobile ? 148 : 182, mobile ? 82 : 98);
};

const drawLog = (ctx, mobile) => {
  const box = mobile ? { x: 252, y: 184, w: 510, h: 94 } : { x: 252, y: 246, w: 510, h: 112 };
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.52)';
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = 'rgba(255,255,255,.16)';
  ctx.strokeRect(box.x, box.y, box.w, box.h);
  ctx.font = '12px monospace';
  ctx.fillStyle = '#e1bee7';
  State.Debate.log.slice(0, mobile ? 3 : 4).forEach((line, i) => ctx.fillText(fit(line, 70), box.x + 14, box.y + 20 + i * 22));
  ctx.restore();
};

const drawMoveButton = (ctx, move, rect, mobile) => {
  const chosen = rect.i === State.Debate.cursor;
  ctx.fillStyle = chosen ? 'rgba(255,235,59,.38)' : 'rgba(255,255,255,.11)';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = chosen ? '#fff176' : 'rgba(255,255,255,.2)';
  ctx.lineWidth = chosen ? 3 : 1.5;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = '#fffde7';
  ctx.font = `bold ${mobile ? 16 : 15}px monospace`;
  ctx.fillText(`${rect.i + 1}. ${fit(move.name, mobile ? 52 : 25)}`, rect.x + 13, rect.y + (mobile ? 17 : 15));
};

const drawMoves = ctx => {
  const layout = battleMoveLayout(ctx.canvas.width, screenWidth(ctx));
  drawPanel(ctx, layout.panel.x, layout.panel.y, layout.panel.w, layout.panel.h, 'Choose Torah Response');
  drawBar(ctx, 52, layout.mobile ? 312 : 408, 270, 16, lightRatio(State.Stats.exp, State.Stats.nextExp), `EXP ${State.Stats.exp}/${State.Stats.nextExp}`, '#29b6f6');
  State.Debate.moves.forEach((move, i) => drawMoveButton(ctx, move, layout.rects[i], layout.mobile));
  ctx.fillStyle = '#b2dfdb';
  ctx.font = '11px monospace';
  ctx.fillText('Tap a large answer. Keyboard: 1-4, arrows + Enter/Z. Esc/X withdraws.', 54, 548);
};

export const renderBattle = ctx => {
  const stats = resolveStats();
  const mobile = battleMoveLayout(ctx.canvas.width, screenWidth(ctx)).mobile;
  ctx.save();
  drawBackdrop(ctx);
  drawCombatants(ctx, stats, mobile);
  drawLog(ctx, mobile);
  drawMoves(ctx);
  drawBattleEffects(ctx);
  ctx.restore();
};
