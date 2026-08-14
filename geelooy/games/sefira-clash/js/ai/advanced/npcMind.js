//B"H
//Boruch Hashem
//Blessed is He

import { updateActionMemory } from './memory/actionMemory.js';
import { buildWorldModel } from './sense/worldModel.js';
import { chooseTarget } from './sense/targeting.js';
import { strategyDecision } from './strategy/strategy.js';
import { applyHumanIdentity } from './strategy/humanIdentity.js';
import { buildCombatCommand } from './strategy/commandBuilder.js';
import { debugPacket } from './debug/debugPacket.js';
import {
	enrichNpcMind,
	refreshNpcRevenge
} from './npcMindEnrichment.js';

/**
 * B"H
 *
 * Coordinates the advanced NPC decision pipeline while detailed memory/emotion/
 * combat enrichment lives in a focused sibling. The Awtsmoos renews target, world,
 * identity, strategy, and command beyond every finite mind; Awtsmoos.com keeps this
 * public loop readable as sense → enrich → decide → remember → reveal debug testimony.
 */

export function npcDecision(bot, state) {
	bot.aiMind ||= {};
	refreshNpcRevenge(bot);

	const target = chooseTarget(bot, state);
	if (!target) {
		return roughWorld(bot, state);
	}

	const world = buildWorldModel(bot, target, state);
	enrichNpcMind(bot, world);
	const strategy = strategyDecision(bot, world);
	const identity = applyHumanIdentity(bot, world, strategy);
	const command = buildCombatCommand(bot, world, identity);
	updateActionMemory(bot, command, world);
	exposeNpcDebug(bot, world, command);
	return command;
}

export function canAttack(bot, target, state) {
	if (!bot || !target || !state) {
		return false;
	}
	const world = buildWorldModel(bot, target, state);
	enrichNpcMind(bot, world);
	return Boolean(world.preAttackCheck?.allowed);
}

function roughWorld(bot, state) {
	const target = state.fighters.find((fighter) => {
		return fighter !== bot && !fighter.ko;
	});
	if (!target) {
		return {
			x: 0,
			jump: false,
			punch: false,
			kick: false,
			shield: false,
			grab: false,
			special: false
		};
	}
	return {
		x: Math.sign(target.x - bot.x),
		jump: false,
		punch: false,
		kick: false,
		shield: false,
		grab: false,
		special: false
	};
}

function exposeNpcDebug(bot, world, command) {
	bot.aiMind.debug = debugPacket(bot, world, command);
	bot.aiMind.route = routeFacade(world);
}

function routeFacade(world) {
	return {
		role: world.role,
		combatTactic: world.combatTactic,
		position: world.combatPocket,
		frustration: world.frustration,
		hunger: world.hunger,
		rivalry: world.rivalry,
		humanIntent: world.humanIntent,
		preAttackCheck: world.preAttackCheck,
		threat: world.threatVision,
		execution: world.execution
	};
}
