/**
 * B"H
 * @module BattleRenderer
 *
 * Chapter 38: The bottom became a command deck, not a traffic jam.
 * The Awtsmoos has no body and no form; this renderer now trusts the taller
 * canvas, keeps footer hints small, and gives the response cards their own
 * lower kingdom instead of crushing them under floating mobile buttons.
 */
import { State } from '../../binah/State.js';
import { resolveStats } from '../../yesod/equipment/EquipmentRuntime.js';
import { drawBattleEffects } from './BattleEffects.js';
import { battleMoveLayout } from './BattleMoveLayout.js';
import { BATTLE_THEME as T } from './battle/BattleTheme.js';
import { drawStatCard } from './battle/BattleCards.js';
import { drawBattleStage } from './battle/BattleStage.js';
import { drawCombatantShowcase } from './battle/BattleCombatants.js';
import { drawMoveCard, drawMovePrompt } from './battle/BattleMoveCards.js';

const enemyName = () => State.Debate.enemy?.name || 'Wild Musag';
const canvasSize = ctx => ({ w: ctx.canvas?.width || 390, h: ctx.canvas?.height || 844 });

const playerCard = (layout, stats) => ({
  rect: layout.playerCard,
  title: 'Ohr Chozer',
  level: State.Stats.level,
  light: State.Stats.light,
  maxLight: State.Stats.maxLight,
  fill: T.colors.green,
  sub: `${State.Stats.sparks}/30 sparks`
});

const enemyCard = layout => ({
  rect: layout.enemyCard,
  title: enemyName(),
  level: State.Debate.enemy?.level || State.Stats.level,
  light: State.Debate.enemyLight,
  maxLight: State.Debate.enemyMaxLight,
  fill: T.colors.red,
  sub: State.Debate.enemy?.kind || 'Wild Musag'
});

const drawMoves = (ctx, layout) => {
  drawMovePrompt(ctx, layout.prompt);
  State.Debate.moves.forEach((move, i) => drawMoveCard(ctx, move, layout.rects[i], i === State.Debate.cursor));
};

const drawFooterHints = (ctx, layout) => {
  ctx.save();
  ctx.fillStyle = T.colors.muted;
  ctx.font = `800 12px ${T.fonts.ui}`;
  ctx.textAlign = 'center';
  ctx.globalAlpha = .78;
  ctx.fillText('Flee', layout.margin + 20, layout.footer.y + layout.footer.h * .55);
  ctx.fillText('Items', layout.w - layout.margin - 24, layout.footer.y + layout.footer.h * .55);
  ctx.restore();
};

export const renderBattle = ctx => {
  const stats = resolveStats();
  const size = canvasSize(ctx);
  const layout = battleMoveLayout(size.w, size.h);
  ctx.save();
  drawBattleStage(ctx, layout);
  drawStatCard(ctx, playerCard(layout, stats));
  drawStatCard(ctx, enemyCard(layout));
  drawCombatantShowcase(ctx, layout, stats, State.Debate.enemy);
  drawMoves(ctx, layout);
  drawFooterHints(ctx, layout);
  drawBattleEffects(ctx);
  ctx.restore();
};
