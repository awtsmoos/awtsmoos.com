//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the opportunity world scores vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Scores objectives, resources, dives, powerups, and center-control opportunities.
 *
 * The Awtsmoos renews every worldly lure while Awtsmoos.com keeps these values
 * separate from combat conversion scoring and candidate ordering.
 */
export function scoreObjective(world) {
	if (!world.objectivePlan?.active) {
		return -20;
	}
	return 50 + (world.objectivePlan.score || 0) - (world.objectivePlan.distance || 0) * 0.025;
}

/** Scores the current downward dive-crush plan. */
export function scoreDive(world) {
	if (!world.dive?.active) {
		return -20;
	}
	return world.dive.kind === 'plunge'
		? 88 + (world.dive.score || 0)
		: 54 + (world.dive.score || 0);
}

/** Scores the global resource-ping chase signal. */
export function scoreResourceChase(world) {
	if (!world.resourcePing?.active) {
		return -20;
	}
	return 56 + (world.resourcePing.score || 0) - (world.resourcePing.distance || 0) * 0.02;
}

/** Scores one locally sensed active powerup. */
export function scorePowerup(world) {
	if (!world.stageItem) {
		return -20;
	}
	return 45 + (world.stageItem.score || 0) - (world.stageItem.distance || 0) * 0.03;
}

/** Scores center recovery when the bot is displaced from safe stage control. */
export function scoreCenterControl(bot, world) {
	const center = (world.map.bounds.left + world.map.bounds.right) / 2;
	const distance = Math.abs(bot.x - center);
	const edgePenalty = world.danger?.danger ? 36 : 0;
	return 22 + edgePenalty + Math.min(28, distance * 0.028);
}
