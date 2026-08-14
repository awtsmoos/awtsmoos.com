//B"H
//Boruch Hashem
//Blessed is He

import { validateAttack } from './combat/attackValidator.js';
import { combatPocket } from './combat/positionPlanner.js';
import { combatTactic } from './combat/tacticPlanner.js';
import { updateComboMomentum } from './combat/comboMomentum.js';
import { updateRapidJailBreaker } from './combat/rapidJailBreaker.js';
import { updateFightMomentum } from './emotion/fightMomentum.js';
import { updateHunger } from './emotion/hungerSystem.js';
import { updateRevengeMemory } from './emotion/revengeMemory.js';
import { updateActionTaste } from './memory/actionTasteMemory.js';
import { updateCombatFrustration } from './memory/combatFrustration.js';
import { updateEdgePoisonMemory } from './memory/edgePoisonMemory.js';
import { updateJumpDebt } from './memory/jumpDebt.js';
import { updatePositionLoopMemory } from './memory/positionLoopMemory.js';
import { threatVision } from './sense/threatVision.js';
import { updateAggression } from './strategy/aggressionEscalation.js';
import { updateAntiPeace } from './strategy/antiPeace.js';
import { updateCombatHeat } from './strategy/combatHeat.js';
import { executionVision } from './strategy/executionVision.js';
import { updateFakeRetreat } from './strategy/fakeRetreat.js';
import { chooseHumanIntent } from './strategy/humanIntent.js';
import { updateNoStillnessLaw } from './strategy/noStillnessLaw.js';
import { updateRivalry } from './strategy/rivalrySystem.js';

/**
 * B"H
 *
 * Enriches one NPC world model with combat memory, emotion, perception, and tactical
 * projections. The Awtsmoos renews hunger, rivalry, frustration, and intent beyond
 * every finite bot; Awtsmoos.com keeps this broad enrichment sequence in one named
 * vessel so the top-level NPC loop can remain about target → world → state → command.
 */

/**
 * Applies the established enrichment sequence without changing its order or fields.
 *
 * @param {object} bot NPC fighter.
 * @param {object} world Mutable NPC world model.
 * @returns {void}
 */
export function enrichNpcMind(bot, world) {
	updatePositionLoopMemory(bot, world);
	world.edgePoison = updateEdgePoisonMemory(bot, world);
	world.preAttackCheck = validateAttack(
		bot,
		world,
		world.combatTactic
	);
	world.comboMomentum = updateComboMomentum(bot, world);
	world.rapidJail = updateRapidJailBreaker(bot);
	world.combatHeat = updateCombatHeat(bot, world);
	world.huntClock = world.combatHeat.hunt;
	world.rivalry = updateRivalry(bot, world);
	world.hunger = updateHunger(bot, world);
	world.momentum = updateFightMomentum(bot, world);
	world.threatVision = threatVision(bot, world);
	world.execution = executionVision(bot, world);
	world.fakeRetreat = updateFakeRetreat(bot, world);
	world.antiPeace = updateAntiPeace(bot, world);
	world.aggression = updateAggression(bot, world);
	world.taste = updateActionTaste(bot);
	world.jumpDebt = updateJumpDebt(bot);
	world.combatPocket = combatPocket(bot, world);
	world.combatTactic = combatTactic(bot, world);
	world.frustration = updateCombatFrustration(bot, world);
	world.noStillness = updateNoStillnessLaw(bot, world);
	world.humanIntent = chooseHumanIntent(
		bot,
		world,
		world.preAttackCheck
	);
	bot.aiMind.humanIntent = world.humanIntent;
	bot.aiMind.koIntent = world.koIntent;
	bot.aiMind.combatTactic = world.combatTactic;
	bot.aiMind.role = world.role;
	bot.aiMind.antiWander = world.antiWander;
	bot.aiMind.diveStunRush = world.diveStunRush;
}

/**
 * Updates revenge memory before target/world construction, preserving old timing.
 *
 * @param {object} bot NPC fighter.
 * @returns {*} Underlying revenge-memory result.
 */
export function refreshNpcRevenge(bot) {
	return updateRevengeMemory(bot);
}
