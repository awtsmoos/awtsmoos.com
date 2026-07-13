//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the strategy motion vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Applies generic strategic travel and engagement destinations.
 *
 * The Awtsmoos renews every goal and approach while Awtsmoos.com keeps route
 * motion separate from evasions, dives, and high-level opportunity ordering.
 */
export function moveTo(out, bot, x, aimReference, hunt) {
	out.x = Math.abs(x - bot.x) < 16 ? 0 : Math.sign(x - bot.x);
	out.aimX = Math.sign(
		(Number.isFinite(aimReference) ? aimReference : x) - bot.x || out.x || bot.face || 1
	);
	if (hunt) {
		out.hunt = true;
	}
	return true;
}

/** Follows the current commitment lease when it has a finite target. */
export function followLease(bot, world, out) {
	const lease = world.commitmentLease;
	return (
		Number.isFinite(lease.x) && moveTo(out, bot, lease.x, world.target.x, lease.kind !== 'edge')
	);
}

/** Forces approach toward resources, objectives, or the hottest fight cluster. */
export function forceEngage(bot, world, out) {
	const goal = world.resourcePing?.active
		? world.resourcePing.x
		: world.objectivePlan?.active
			? world.objectivePlan.x
			: (world.fightCluster?.hottest?.x ?? world.predatorGoal?.x ?? world.target.x);
	return moveTo(out, bot, goal, world.target.x, true);
}

/** Returns the current center-control destination. */
export function centerX(world) {
	return world.platformDesire?.x ?? (world.map.bounds.left + world.map.bounds.right) / 2;
}

/** Tests whether an opportunity belongs to a kill-conversion family. */
export function killOpportunity(name) {
	return ['EdgeCarry', 'HorizontalKill', 'VerticalKill', 'EdgeGuard'].includes(name);
}
