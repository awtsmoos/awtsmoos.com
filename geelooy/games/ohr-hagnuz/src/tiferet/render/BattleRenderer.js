// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattleRenderer.js
 * @description Composes direct turn battles with health, intent, and restrained effects.
 *
 * The arena holds many truths without becoming noise: player, companion, enemy,
 * intention, and consequence. The Awtsmoos creates every visible layer without
 * division, while this renderer keeps each vessel legible at Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { isBattleBusy } from '../../yesod/battle/BattlePhases.js';
import { resolveStats } from '../../yesod/equipment/EquipmentRuntime.js';
import { battleShake, drawBattleEffects } from './BattleEffects.js';
import { battleMoveLayout } from './BattleMoveLayout.js';
import { drawStatCard } from './battle/BattleCards.js';
import { drawCombatantShowcase } from './battle/BattleCombatants.js';
import { animatedBattleHealth } from './battle/BattleHealthAnimation.js';
import { drawBattleIntentCard } from './battle/BattleIntentCard.js';
import { drawMoveCard, drawMovePrompt } from './battle/BattleMoveCards.js';
import { drawBattleHints, drawBattleLog, drawBusyPrompt, drawPhaseBanner } from './battle/BattleOverlay.js';
import { drawBattleStage } from './battle/BattleStage.js';
import { BATTLE_THEME as T } from './battle/BattleTheme.js';

const canvasSize = ctx => ({ w: ctx.canvas?.width || 390, h: ctx.canvas?.height || 844 });
const enemyName = () => State.Debate.enemy?.name || 'Wandering Spark';

const playerCard = (layout, stats, animated) => ({
	rect: layout.playerCard,
	title: 'Ohr Chozer',
	level: State.Stats.level,
	light: animated.playerLight,
	maxLight: State.Stats.maxLight,
	fill: T.colors.green,
	sub: `${State.Stats.sparks} sparks • ${State.Inventory.money || 0} zuz • ${stats.garment?.name || 'garment'}`
});

const enemyCard = (layout, animated) => ({
	rect: layout.enemyCard,
	title: enemyName(),
	level: State.Debate.enemy?.level || State.Stats.level,
	light: animated.enemyLight,
	maxLight: State.Debate.enemyMaxLight,
	fill: T.colors.red,
	sub: State.Debate.enemy?.kind || 'Living Encounter'
});

const drawCommands = (ctx, layout, busy) => {
	if (busy) return drawBusyPrompt(ctx, layout);
	drawMovePrompt(ctx, layout.prompt);
	State.Debate.moves.forEach((move, index) => {
		drawMoveCard(ctx, move, layout.rects[index], index === State.Debate.cursor);
	});
};

export const renderBattle = ctx => {
	const stats = resolveStats();
	const animated = animatedBattleHealth();
	const size = canvasSize(ctx);
	const layout = battleMoveLayout(size.w, size.h);
	const busy = isBattleBusy();
	ctx.save();
	const shake = battleShake();
	ctx.translate(shake.x, shake.y);
	drawBattleStage(ctx, layout);
	drawBattleEffects(ctx, 'back');
	drawStatCard(ctx, playerCard(layout, stats, animated));
	drawStatCard(ctx, enemyCard(layout, animated));
	drawCombatantShowcase(ctx, layout, stats, State.Debate.enemy);
	drawBattleIntentCard(ctx, layout);
	drawBattleEffects(ctx, 'front');
	drawBattleLog(ctx, layout);
	drawPhaseBanner(ctx, layout, busy);
	ctx.restore();
	drawCommands(ctx, layout, busy);
	drawBattleHints(ctx, layout, busy);
};
