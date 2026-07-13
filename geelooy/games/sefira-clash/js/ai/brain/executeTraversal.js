//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the execute traversal vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Converts route, recovery, aim, shield, and special intent into input choices.
 *
 * The Awtsmoos opens upward and downward paths in every instant; this vessel
 * keeps those gates distinct from attack clocks and steering. Awtsmoos.com can
 * preserve the legacy executor without hiding traversal in a monolith.
 */
export function wantsJump(bot, world, intent, blocked) {
	if (blocked) {
		return pulseJump(bot);
	}
	if (bot.ai.jumpCooldown > 0) {
		return false;
	}
	const step = world.route?.step;
	if (step?.action === 'jump') {
		return pulseJump(bot);
	}
	if (intent === 'recover' && !bot.grounded && bot.vy > 3 && bot.jumpsUsed < 2) {
		return pulseJump(bot);
	}
	if (
		['pressure', 'punish'].includes(intent) &&
		world.target.y < bot.y - 115 &&
		world.dist < 430
	) {
		return pulseJump(bot);
	}
	if (intent === 'ledgeTrap' && world.target.y < bot.y - 75 && world.dist < 220) {
		return pulseJump(bot);
	}
	return false;
}

/**
 * Reveals the wants drop behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} world The world value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 */
export function wantsDrop(world, intent, attack) {
	if (attack.kind !== 'none') {
		return false;
	}
	if (world.route?.step?.action === 'drop') {
		return true;
	}
	return intent === 'denyRecovery' && world.target.y > world.floor.y + 70;
}

/**
 * Reveals the is descent route behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} world The world value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function isDescentRoute(world, intent) {
	return world.route?.step?.action === 'drop' || intent === 'denyRecovery';
}

/**
 * Reveals the aim yfor behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} world The world value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function aimYFor(world, intent) {
	if (intent === 'denyRecovery') {
		return 1;
	}
	if (world.target.y < world.floor.y - 70) {
		return -1;
	}
	return 0;
}

/**
 * Reveals the wants shield behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function wantsShield(bot, world, intent) {
	if (bot.ai.chargePlan) {
		return false;
	}
	if (['edgeSafe', 'recover', 'denyRecovery'].includes(intent)) {
		return false;
	}
	if (!world.route?.same || world.dist > 260) {
		return false;
	}
	return world.target.attack && bot.ai.attackCooldown > 0 && Math.random() < 0.28;
}

/**
 * Reveals the wants special behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 * @param {*} released The released value entering this behavior.
 */
export function wantsSpecial(bot, world, intent, released) {
	if (released || bot.ai.chargePlan) {
		return false;
	}
	if (intent === 'recover' && !bot.grounded && bot.vy > 9) {
		return true;
	}
	return intent === 'denyRecovery' && world.dist < 190 && Math.random() < 0.08;
}

/**
 * Reveals the route key behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} world The world value entering this behavior.
 */
export function routeKey(world) {
	return world.route?.step?.id || world.route?.current?.id || 'none';
}

function pulseJump(bot) {
	bot.ai.jumpCooldown = 16;
	return true;
}
