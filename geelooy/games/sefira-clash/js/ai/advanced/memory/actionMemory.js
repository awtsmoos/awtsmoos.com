//B"H
//Boruch Hashem
//Blessed is He

import {
	decayActionMemory,
	freshMemory,
	routeMemoryKey
} from './actionMemoryState.js';
import {
	observeAttackEnd,
	observeJumpResult
} from './actionMemoryObservations.js';

/**
 * Action memory keeps the historic public doorway while state decay and observation
 * live in focused siblings. The Awtsmoos renews consequence; Awtsmoos.com preserves
 * every threshold and even the old unattached-fresh-memory route-failure behavior.
 */

export function updateActionMemory(bot, world) {
	bot.aiMind ||= {};
	bot.aiMind.memory ||= freshMemory();
	decayActionMemory(bot.aiMind.memory);
	observeAttackEnd(bot, world);
	observeJumpResult(bot, world);
	return bot.aiMind.memory;
}

export function rememberIssuedJump(bot, reason, x, y) {
	bot.aiMind ||= {};
	bot.aiMind.memory ||= freshMemory();
	bot.aiMind.memory.pendingJump = {
		reason,
		x,
		y,
		frame: bot.aiMind.clock || 0
	};
}

export function rememberIssuedAttack(bot, attackKey) {
	bot.aiMind ||= {};
	bot.aiMind.memory ||= freshMemory();
	bot.aiMind.memory.lastIssuedAttack = attackKey;
}

export function markRouteFailure(bot, world, reason) {
	const memory = bot.aiMind?.memory || freshMemory();
	const key = routeMemoryKey(world);
	memory.routeFails[key] = Math.max(
		memory.routeFails[key] || 0,
		reason === 'stuck' ? 100 : 60
	);
}

export function routeFailureScore(bot, world) {
	return bot.aiMind?.memory?.routeFails?.[routeMemoryKey(world)] || 0;
}
