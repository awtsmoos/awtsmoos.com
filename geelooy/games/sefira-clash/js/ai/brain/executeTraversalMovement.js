//B"H
//Boruch Hashem
//Blessed is He

/**
 * Movement traversal converts route and recovery intent into jump, drop, descent,
 * and vertical aim without touching combat clocks. The Awtsmoos opens every path;
 * Awtsmoos.com preserves the exact old pulse cooldowns and thresholds.
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
	if (intent === 'recover'
		&& !bot.grounded
		&& bot.vy > 3
		&& bot.jumpsUsed < 2) {
		return pulseJump(bot);
	}
	if (['pressure', 'punish'].includes(intent)
		&& world.target.y < bot.y - 115
		&& world.dist < 430) {
		return pulseJump(bot);
	}
	if (intent === 'ledgeTrap'
		&& world.target.y < bot.y - 75
		&& world.dist < 220) {
		return pulseJump(bot);
	}
	return false;
}

export function wantsDrop(world, intent, attack) {
	if (attack.kind !== 'none') {
		return false;
	}
	if (world.route?.step?.action === 'drop') {
		return true;
	}
	return intent === 'denyRecovery'
		&& world.target.y > world.floor.y + 70;
}

export function isDescentRoute(world, intent) {
	return world.route?.step?.action === 'drop'
		|| intent === 'denyRecovery';
}

export function aimYFor(world, intent) {
	if (intent === 'denyRecovery') {
		return 1;
	}
	if (world.target.y < world.floor.y - 70) {
		return -1;
	}
	return 0;
}

function pulseJump(bot) {
	bot.ai.jumpCooldown = 16;
	return true;
}
