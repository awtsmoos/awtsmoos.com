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
import {
	drawBattleHints,
	drawBattleLog,
	drawBusyPrompt,
	drawPhaseBanner
} from './battle/BattleOverlay.js';
import { drawBattleStage } from './battle/BattleStage.js';
import { BATTLE_THEME as T } from './battle/BattleTheme.js';
import { readCanvasViewport } from './canvas/CanvasViewport.js';

const canvasSize = context => readCanvasViewport(context);
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

const drawCommands = (context, layout, busy) => {
	if (busy) {
		drawBusyPrompt(context, layout);
		return;
	}
	drawMovePrompt(context, layout.prompt);
	State.Debate.moves.forEach((move, index) => {
		drawMoveCard(context, move, layout.rects[index], index === State.Debate.cursor);
	});
};

export const renderBattle = context => {
	const stats = resolveStats();
	const animated = animatedBattleHealth();
	const size = canvasSize(context);
	const layout = battleMoveLayout(size.w, size.h);
	const busy = isBattleBusy();
	context.save();
	const shake = battleShake();
	context.translate(shake.x, shake.y);
	drawBattleStage(context, layout);
	drawBattleEffects(context, 'back');
	drawStatCard(context, playerCard(layout, stats, animated));
	drawStatCard(context, enemyCard(layout, animated));
	drawCombatantShowcase(context, layout, stats, State.Debate.enemy);
	drawBattleIntentCard(context, layout);
	drawBattleEffects(context, 'front');
	drawBattleLog(context, layout);
	drawPhaseBanner(context, layout, busy);
	context.restore();
	drawCommands(context, layout, busy);
	drawBattleHints(context, layout, busy);
};
