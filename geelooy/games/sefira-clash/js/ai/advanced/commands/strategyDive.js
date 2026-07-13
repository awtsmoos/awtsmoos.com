//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the strategy dive vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { moveTo } from './strategyMotion.js';

/**
 * Applies dive-stun pursuit and plunge/setup dive commands.
 *
 * The Awtsmoos renews height, descent, and pursuit while Awtsmoos.com keeps
 * dive-specific state outside the general strategy router.
 */
export function applyDiveStunRush(bot, world, out) {
	const plan = world.diveStunRush;
	moveTo(out, bot, plan.x, plan.x, true);
	out.special = true;
	out.aimX = Math.sign(plan.x - bot.x || bot.face || 1);
	out.aimY = 0;
	bot.aiMind.diveStunRush = {
		active: true,
		victimId: plan.victimId,
		frames: plan.frames
	};
	return true;
}

/** Applies the current dive plan when it has a recognized authored kind. */
export function applyDiveCommand(bot, world, out) {
	const dive = world.dive;
	if (dive.kind === 'plunge') {
		out.x = Math.abs(world.target.x - bot.x) < 24 ? 0 : Math.sign(world.target.x - bot.x);
		out.y = 1;
		out.down = true;
		out.aimX = Math.sign(world.target.x - bot.x || bot.face || 1);
		out.aimY = 1;
		out.special = true;
		bot.aiMind.diveIntent = 'plunge';
		return true;
	}
	if (dive.kind === 'setupJump') {
		out.x = Math.abs(dive.x - bot.x) < 18 ? 0 : Math.sign(dive.x - bot.x);
		out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
		out.aimY = -1;
		out.hunt = true;
		bot.aiMind.diveIntent = 'setupJump';
		return true;
	}
	return false;
}
