//B"H
//Boruch Hashem
//Blessed is He

import {
	inwardDirection,
	toward
} from './unstuckDirection.js';

/**
 * B"H
 *
 * Builds immutable-looking escape instructions after detection has already decided
 * that an NPC needs a route out. The Awtsmoos renews lip, route, jump, and descent
 * beyond every finite enclosure; Awtsmoos.com keeps plan construction separate from
 * stuck detection so the public escape policy reads as decisions rather than fields.
 */

export function escapePlan(
	t,
	mode,
	dir,
	jumpAt,
	dropAt,
	airJumpAt
) {
	return {
		t,
		mode,
		dir,
		jumpAt,
		dropAt,
		airJumpAt
	};
}

export function escapeLipPlan(lip) {
	if (lip.kind === 'topEdge' && lip.safeBelow) {
		return {
			...escapePlan(46, 'lipDrop', lip.dropDir, 0, 1, 0),
			lip
		};
	}
	return {
		...escapePlan(82, 'lipClimb', lip.climbDir, 1, 0, 12),
		lip
	};
}

export function escapeRoutePlan(bot, world) {
	const direction = world.route?.targetX !== undefined
		? toward(world.route.targetX, bot.x)
		: bot.ai.laneBias || 1;
	return escapePlan(
		54,
		'route',
		direction,
		world.route?.needsJump ? 2 : 0,
		world.route?.needsDrop ? 2 : 0,
		world.route?.needsJump ? 18 : 0
	);
}

export function ledgeEscapePlan(bot, world, below) {
	if (below) {
		return escapePlan(
			58,
			'drop',
			toward(below.x + below.w / 2, bot.x),
			0,
			1,
			0
		);
	}
	return escapePlan(
		70,
		'jump',
		inwardDirection(bot, world),
		1,
		0,
		16
	);
}

export function wallEscapePlan(bot, world) {
	return escapePlan(
		78,
		'wall',
		toward(world.wall.escapeX, bot.x),
		world.wall.escapeY < bot.y - 80 ? 2 : 0,
		0,
		18
	);
}
