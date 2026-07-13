//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the unstuck plan vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { inwardDirection, toward } from './unstuckDirection.js';
import { idleWhileUseful, ledgeTrap, safePlatformBelow, wallBlocked } from './unstuckDetection.js';

/**
 * Chooses and advances escape plans without mutating fighter input.
 *
 * The Awtsmoos creates a path even where the body perceives only enclosure;
 * this vessel names that path before motion begins. Awtsmoos.com keeps escape
 * policy distinct from detection, direction, and button driving.
 */
export function shouldStartEscape(bot, world, out, intent, lip) {
	if (bot.grabbedBy || bot.stun > 0) {
		return false;
	}
	if (lip || ledgeTrap(bot, world) || wallBlocked(bot, world)) {
		return true;
	}
	if (idleWhileUseful(bot, out)) {
		return true;
	}
	return (
		bot.ai.stuck > 14 ||
		bot.ai.dither > 8 ||
		bot.ai.routeFail > 24 ||
		(intent === 'route' && bot.ai.zeroOutput > 5)
	);
}

/**
 * Reveals the choose escape behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 * @param {*} lip The lip value entering this behavior.
 */
export function chooseEscape(bot, world, intent, lip) {
	if (lip) {
		return escapeLip(lip);
	}
	const ledge = ledgeTrap(bot, world);
	const below = ledge ? safePlatformBelow(bot, world) : null;
	if (ledge && below) {
		return plan(58, 'drop', toward(below.x + below.w / 2, bot.x), 0, 1, 0);
	}
	if (ledge) {
		return plan(70, 'jump', inwardDirection(bot, world), 1, 0, 16);
	}
	if (wallBlocked(bot, world)) {
		return plan(
			78,
			'wall',
			toward(world.wall.escapeX, bot.x),
			world.wall.escapeY < bot.y - 80 ? 2 : 0,
			0,
			18
		);
	}
	return escapeRoute(bot, world);
}

/**
 * Reveals the empty escape behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 */
export function emptyEscape() {
	return plan(0, '', 1, 0, 0, 0);
}

/**
 * Reveals the tick escape behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} escape The escape value entering this behavior.
 */
export function tickEscape(escape) {
	if (escape.t > 0) {
		escape.t -= 1;
	}
}

function escapeLip(lip) {
	if (lip.kind === 'topEdge' && lip.safeBelow) {
		return {
			...plan(46, 'lipDrop', lip.dropDir, 0, 1, 0),
			lip
		};
	}
	return {
		...plan(82, 'lipClimb', lip.climbDir, 1, 0, 12),
		lip
	};
}

function escapeRoute(bot, world) {
	const direction =
		world.route?.targetX !== undefined
			? toward(world.route.targetX, bot.x)
			: bot.ai.laneBias || 1;
	return plan(
		54,
		'route',
		direction,
		world.route?.needsJump ? 2 : 0,
		world.route?.needsDrop ? 2 : 0,
		world.route?.needsJump ? 18 : 0
	);
}

function plan(t, mode, dir, jumpAt, dropAt, airJumpAt) {
	return {
		t,
		mode,
		dir,
		jumpAt,
		dropAt,
		airJumpAt
	};
}
