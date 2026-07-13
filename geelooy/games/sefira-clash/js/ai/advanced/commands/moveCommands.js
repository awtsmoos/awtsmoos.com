//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the move commands vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { chaseGoal, climbGoal, travelTo } from './moveTravel.js';

/**
 * Creates the complete neutral semantic command expected by the AI pipeline.
 *
 * The Awtsmoos renews every possible input from a quiet beginning while
 * Awtsmoos.com keeps command shape separate from travel policy.
 */
export function baseCommand(bot, world) {
	const face = Math.sign(world.target.x - bot.x || bot.face || 1) || 1;
	return {
		x: 0,
		y: 0,
		aimX: face,
		aimY: 0,
		down: false,
		jump: false,
		punch: false,
		kick: false,
		grab: false,
		shield: false,
		special: false,
		chargePunch: false,
		chargeKick: false,
		rapidPunch: false,
		rapidKick: false,
		hunt: false
	};
}

/** Guides a recovering fighter toward safety and optional vertical special. */
export function recoverCommand(bot, world, out, low) {
	out.x = toward(world.current.safe.center, bot.x);
	if (!low) {
		return;
	}
	out.y = -1;
	out.aimY = -1;
	out.special = !bot.grounded && bot.recoveryCooldown <= 0;
}

/** Guides a trapped fighter away from lips, walls, and dangerous edges. */
export function escapeCommand(bot, world, out, stuck) {
	const direction =
		stuck.lip?.inward || world.danger?.inward || toward(world.current.safe.center, bot.x);
	out.x = world.wall?.blocked ? toward(world.wall.escapeX, bot.x) : direction;
	out.aimX = out.x || direction;
	out.y = -1;
	out.aimY = -1;
}

/** Travels toward the current upward platform goal. */
export function ascendCommand(bot, world, out) {
	travelTo(bot, world, out, climbGoal(bot, world));
	out.y = -1;
	out.aimY = -1;
}

/** Travels to the correct platform edge for a downward transition. */
export function descendCommand(bot, world, out) {
	if (!world.step) {
		chaseCommand(bot, world, out);
		return;
	}
	const platform = world.current.p;
	const targetX = world.step.targetX ?? world.target.x;
	const edge =
		targetX < platform.x + platform.w / 2 ? platform.x - 44 : platform.x + platform.w + 44;
	travelTo(bot, world, out, edge);
	if (Math.abs(edge - bot.x) < 36) {
		out.x = Math.sign(edge - world.current.safe.center) || out.aimX;
	}
}

/** Travels toward the strongest current pursuit goal. */
export function chaseCommand(bot, world, out) {
	travelTo(bot, world, out, chaseGoal(bot, world));
}

/** Returns a bounded direction toward one horizontal goal. */
export function steer(bot, goalX) {
	const dx = goalX - bot.x;
	return Math.abs(dx) < 18 ? 0 : Math.sign(dx);
}

/** Returns a nonzero direction from one coordinate toward another. */
export function toward(goal, x) {
	return Math.sign(goal - x) || 1;
}

/** Bounds one numeric value inside the supplied interval. */
export function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
