//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the move travel vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { clamp, steer } from './moveCommands.js';

/**
 * Converts one route or pursuit goal into committed horizontal travel.
 *
 * The Awtsmoos renews distance and pursuit while Awtsmoos.com keeps steering,
 * hunt marking, and platform desire outside the public command facade.
 */
export function travelTo(bot, world, out, goal) {
	const slack = huntSlack(bot);
	const safeGoal =
		world.route?.found && !world.landingTrap?.active
			? clamp(goal, world.current.safe.left - slack, world.current.safe.right + slack)
			: goal;
	out.x = committedSteer(bot, world, safeGoal);
	out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
	if (world.combat?.shouldChaseVertical) {
		out.y = Math.sign(world.target.y - bot.y);
	}
	markHunt(bot, world, out);
}

/**
 * Selects the strongest current chase destination.
 */
export function chaseGoal(bot, world) {
	if (world.landingTrap?.active) {
		return world.landingTrap.x;
	}
	if (world.platformDesire && shouldTakePlatform(bot, world)) {
		return world.platformDesire.x;
	}
	const bored = (bot.aiMind?.combatHeat?.noDamageFrames || 0) > 160;
	if (!world.route?.found) {
		return world.predatorGoal?.x ?? world.prediction?.x ?? world.target.x;
	}
	if (world.current.id === world.goal.id && !bored) {
		return world.combatPocket?.standX ?? world.predatorGoal?.x ?? world.target.x;
	}
	return world.step?.targetX ?? world.predatorGoal?.x ?? world.goal.safe.center;
}

/**
 * Selects the strongest current upward-route destination.
 */
export function climbGoal(bot, world) {
	return (
		world.landingTrap?.x ??
		world.platformDesire?.x ??
		world.step?.targetX ??
		world.predatorGoal?.x ??
		world.target.x
	);
}

function shouldTakePlatform(bot, world) {
	const desire = world.platformDesire;
	return Boolean(
		desire &&
		(desire.reason === 'landingTrap' ||
			world.huntClock?.active ||
			Math.abs(desire.x - bot.x) > 260)
	);
}

function committedSteer(bot, world, goalX) {
	const dx = goalX - bot.x;
	if (Math.abs(dx) < 18 && Math.abs(world.target.x - bot.x) > 220) {
		return Math.sign(world.target.x - bot.x) || bot.face || 1;
	}
	return steer(bot, goalX);
}

function markHunt(bot, world, out) {
	const far = Math.abs(world.target.x - bot.x) > 620 || Math.abs(world.target.y - bot.y) > 380;
	const bored = (bot.aiMind?.combatHeat?.noDamageFrames || 0) > 130;
	out.hunt = Boolean(out.x) && (far || bored || world.huntClock?.active);
}

function huntSlack(bot) {
	return Math.min(320, Math.max(40, (bot.aiMind?.combatHeat?.noDamageFrames || 0) * 0.45));
}
