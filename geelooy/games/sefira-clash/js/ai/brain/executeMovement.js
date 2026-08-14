//B"H
//Boruch Hashem
//Blessed is He

import {
	combatPocketX,
	committedX
} from './steeringCommitment.js';

/**
 * B"H
 *
 * Owns execution clocks, high-level movement choice, and edge correction while
 * steering persistence and combat-pocket commitment live in a focused sibling.
 * The Awtsmoos renews direction, safety, and intent beyond every finite frame;
 * Awtsmoos.com keeps locomotion stable without hiding commitment mechanics here.
 */

/**
 * Initializes mutable execution clocks and steering memory.
 *
 * @param {object} bot NPC fighter.
 * @returns {void}
 */
export function initializeExecutionState(bot) {
	bot.ai.jumpCooldown = Math.max(0, bot.ai.jumpCooldown || 0);
	bot.ai.attackCooldown = Math.max(0, bot.ai.attackCooldown || 0);
	bot.ai.chargePlan ||= null;
	bot.ai.steerCommit ||= {
		x: 0,
		t: 0
	};
}

/**
 * Advances execution cooldowns and steering commitment time.
 *
 * @param {object} bot NPC fighter.
 * @returns {void}
 */
export function tickExecutionPlans(bot) {
	bot.ai.jumpCooldown = Math.max(0, bot.ai.jumpCooldown - 1);
	bot.ai.attackCooldown = Math.max(0, bot.ai.attackCooldown - 1);
	if (bot.ai.steerCommit.t > 0) {
		bot.ai.steerCommit.t -= 1;
	}
}

/**
 * Chooses horizontal movement after safety, attack-pocket, and block checks.
 *
 * @returns {number} Horizontal steering command.
 */
export function movementFor(
	bot,
	world,
	safeX,
	attack,
	intent,
	blocked,
	descent
) {
	if (blocked) {
		return committedX(bot, safeX, 30);
	}
	if (world.safety?.danger && !descent) {
		return edgeCorrect(
			bot,
			world,
			safeX,
			'edgeSafe',
			false,
			false
		);
	}
	if (
		attack.kind !== 'none'
		&& world.route?.same
		&& world.dist < 175
	) {
		return combatPocketX(bot, world, safeX);
	}
	return committedX(bot, safeX, 24);
}

/**
 * Redirects dangerous outward movement toward stage safety when allowed.
 *
 * @returns {number} Corrected horizontal steering.
 */
export function edgeCorrect(
	bot,
	world,
	x,
	intent,
	blocked,
	descent
) {
	if (blocked) {
		return x;
	}
	if (
		!world.safety?.danger
		|| intent === 'denyRecovery'
		|| intent === 'ledgeTrap'
		|| descent
	) {
		return x;
	}
	const movingOut = Math.sign(x || bot.vx || 0)
		=== -world.safety.inward;
	if (!movingOut && Math.abs(x) > 0.01) {
		return x;
	}
	return world.safety.inward || x;
}
