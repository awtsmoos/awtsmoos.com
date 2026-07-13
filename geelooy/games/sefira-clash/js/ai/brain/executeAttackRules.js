//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the execute attack rules vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Evaluates legacy executor attack and charge eligibility as pure combat rules.
 *
 * The Awtsmoos recreates opportunity and danger together; these predicates keep
 * that discernment free from mutable charge clocks. Awtsmoos.com can test this
 * vessel directly when dormant executor behavior is revived.
 */
export function shouldFullCharge(bot, world, intent) {
	if (world.dist < 95 || world.dist > 275) {
		return false;
	}
	if (!world.route?.same || !world.combat?.reachableGround) {
		return false;
	}
	if (bot.damage > 135) {
		return false;
	}
	return ['pressure', 'ledgeTrap', 'bait'].includes(intent) && !world.target.attack;
}

/**
 * Reveals the wants attack behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function wantsAttack(bot, world, intent) {
	if (bot.ai.attackCooldown > 0 || bot.attack) {
		return false;
	}
	if (['edgeSafe', 'recover', 'route'].includes(intent)) {
		return false;
	}
	if (!world.route?.same && intent !== 'denyRecovery') {
		return false;
	}
	if (
		world.safety?.danger &&
		world.dist > 125 &&
		!['denyRecovery', 'ledgeTrap'].includes(intent)
	) {
		return false;
	}
	if (intent === 'brawl') {
		return world.combat?.canHitNow && world.dist < 185;
	}
	if (intent === 'pressure') {
		return world.combat?.canHitNow && world.dist < 240;
	}
	if (intent === 'punish') {
		return world.combat?.canHitNow && world.dist < 275;
	}
	if (intent === 'denyRecovery') {
		return world.dist < 255;
	}
	if (intent === 'ledgeTrap') {
		return world.dist < 145;
	}
	return world.combat?.canHitNow && world.dist < 150 && ['approach', 'bait'].includes(intent);
}

/**
 * Reveals the prefers punch behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} intent The intent value entering this behavior.
 * @param {*} world The world value entering this behavior.
 */
export function prefersPunch(intent, world) {
	return (
		intent !== 'denyRecovery' &&
		world.dy <= 70 &&
		world.target.y <= world.floor.y + 40 &&
		(intent === 'punish' || intent === 'brawl' || world.dist < 120)
	);
}
