// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets each Shlichus read progress from truth already living in the
 * world. No duplicate quest simulation or per-frame search is required.
 */
export function adventureMetric(world, step) {
	if (!world || !step) return 0;
	if (step.metric === 'captures') return world.telemetry.captures || 0;
	if (step.metric === 'mass') return world.player.mass || 0;
	if (step.metric === 'districts') return world.telemetry.districtCount || 0;
	if (step.metric === 'chain') return world.telemetry.maxChain || 0;
	if (step.metric === 'rivals') return world.telemetry.rivalsEaten || 0;
	if (step.metric === 'powerups') return world.telemetry.powerups || 0;
	if (step.metric === 'impacts') return world.telemetry.impacts || 0;
	if (step.metric === 'category') return world.consumed[step.category] || 0;
	return 0;
}

/** Absolute stages measure the whole round; delta stages begin when activated. */
export function adventureProgress(world, step) {
	const value = adventureMetric(world, step);
	return Math.max(0, step.absolute ? value : value - step.baseline);
}
