/**
 * B"H
 * @module BattleRenderer
 *
 * Chapter 26: The Battle Became The Picture.
 * The Awtsmoos has no body and no form; this canvas now imitates the mockup's
 * order: two stat cards, a VS seal, glowing combatants, and four tall answers.
 */
import { State } from '../../binah/State.js';
import { resolveStats } from '../../yesod/equipment/EquipmentRuntime.js';
import { drawOpponentGlyph, drawPlayerGlyph } from './BattleGlyphs.js';
import { drawBattleEffects } from './BattleEffects.js';
import { battleMoveLayout } from './BattleMoveLayout.js';
import { BATTLE_THEME as T } from './battle/BattleTheme.js';
import { drawStatCard } from './battle/BattleCards.js';
import { drawBattleStage, drawAura } from './battle/BattleStage.js';
import { drawMoveCard, drawMovePrompt } from './battle/BattleMoveCards.js';

const enemyName = () => State.Debate.enemy?.name || 'Wild Musag';

const playerCard = stats => ({
  x: 34, y: 34, w: 280, h: 118, title: 'Ohr Chozer', level: State.Stats.level,
  light: State.Stats.light, maxLight: State.Stats.maxLight, fill: '#66bb6a',
  sub: `SPARKS ${State.Stats.sparks}/30  |  Ch ${stats.chochmah} Bi ${stats.binah}`
});

const enemyCard = () => ({
  x: 486, y: 34, w: 280, h: 118, title: enemyName(), level: State.Stats.level,
  light: State.Debate.enemyLight, maxLight: State.Debate.enemyMaxLight, fill: '#c62828',
  sub: `Glyph ${State.Debate.enemy?.glyph || '?'} | ${State.Debate.enemy?.kind || 'Wild Musag'}`
});

const drawCombatants = (ctx, stats) => {
  drawAura(ctx, 210, 278, T.playerGlow);
  drawAura(ctx, 588, 278, T.enemyGlow);
  drawPlayerGlyph(ctx, stats, 210, 264, 92);
  drawOpponentGlyph(ctx, State.Debate.enemy?.glyph, 588, 264, 96);
};

const drawMoves = ctx => {
  const { rects } = battleMoveLayout();
  drawMovePrompt(ctx);
  State.Debate.moves.forEach((move, i) => drawMoveCard(ctx, move, rects[i], i === State.Debate.cursor));
};

const drawFooterHints = ctx => {
  ctx.save();
  ctx.fillStyle = T.sub;
  ctx.font = '12px monospace';
  ctx.fillText('Flee', 52, 552);
  ctx.fillText('Items', 700, 552);
  ctx.restore();
};

export const renderBattle = ctx => {
  const stats = resolveStats();
  ctx.save();
  drawBattleStage(ctx);
  drawStatCard(ctx, playerCard(stats));
  drawStatCard(ctx, enemyCard());
  drawCombatants(ctx, stats);
  drawMoves(ctx);
  drawFooterHints(ctx);
  drawBattleEffects(ctx);
  ctx.restore();
};
