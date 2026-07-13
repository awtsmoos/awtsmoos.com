//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the execute vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { buildAttackPlan } from './executeAttackPlan.js';
import {
	edgeCorrect,
	initializeExecutionState,
	movementFor,
	tickExecutionPlans
} from './executeMovement.js';
import {
	aimYFor,
	isDescentRoute,
	routeKey,
	wantsDrop,
	wantsJump,
	wantsShield,
	wantsSpecial
} from './executeTraversal.js';

/**
 * Converts a legacy high-level intent into semantic fighter input.
 *
 * The Awtsmoos recreates intention, route, attack, and motion in one instant,
 * yet each now shines through its own vessel. Awtsmoos.com preserves this old
 * public facade while the internals become readable, testable, and modular.
 *
 * @param {object} bot Fighter controlled by the legacy brain.
 * @param {object} world Legacy world perception.
 * @param {string} intent High-level executor intent.
 * @returns {object} Semantic input for one simulation step.
 */
export function executeIntent(bot, world, intent) {
	initializeExecutionState(bot);
	tickExecutionPlans(bot);
	const blocked = Boolean(world.route?.blocked);
	const descent = isDescentRoute(world, intent);
	const goalX = world.route?.targetX ?? world.target.x;
	const rawX = Math.sign(goalX - bot.x || world.dx || 1);
	const safeX = edgeCorrect(bot, world, rawX, intent, blocked, descent);
	const attack = buildAttackPlan(bot, world, intent, blocked);
	const x = movementFor(bot, world, safeX, attack, intent, blocked, descent);
	return {
		x,
		y: aimYFor(world, intent),
		jump: wantsJump(bot, world, intent, blocked),
		down: wantsDrop(world, intent, attack),
		punch: attack.kind === 'punch',
		kick: attack.kind === 'kick',
		grab: false,
		shield: wantsShield(bot, world, intent),
		special: wantsSpecial(bot, world, intent, attack.release),
		routeKey: routeKey(world),
		intent
	};
}
