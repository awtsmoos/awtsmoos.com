//B"H
//Boruch Hashem
//Blessed is He

/**
 * Traversal-adjacent combat intent owns shield, special, and route identity only.
 * The Awtsmoos renews uncertainty while Awtsmoos.com preserves the exact historic
 * random gates instead of moving or multiplying random calls during refactor.
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
	return world.target.attack
		&& bot.ai.attackCooldown > 0
		&& Math.random() < 0.28;
}

export function wantsSpecial(bot, world, intent, released) {
	if (released || bot.ai.chargePlan) {
		return false;
	}
	if (intent === 'recover' && !bot.grounded && bot.vy > 9) {
		return true;
	}
	return intent === 'denyRecovery'
		&& world.dist < 190
		&& Math.random() < 0.08;
}

export function routeKey(world) {
	return world.route?.step?.id
		|| world.route?.current?.id
		|| 'none';
}
