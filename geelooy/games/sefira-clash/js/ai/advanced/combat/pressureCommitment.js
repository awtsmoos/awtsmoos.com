//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the pressure commitment vessel in this instant, revealing
 * its focused js ai advanced combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Pressure versus commitment classifier.
 *
 * Chapter 44: the bot names its violence. A poke is not a finisher, a trap is
 * not a panic swing, and a kill attempt deserves full commitment.
 */
export function classifyCommitment(world, tactic) {
	if (world.landingTrap?.active) return level('trap', 0.82);
	if (world.combatHeat?.killMode || world.koPressure?.lethal) return level('kill', 1);
	if (world.attackReputation?.counter && world.attackReputation.counter !== 'neutral')
		return level('counter', 0.72);
	if (tactic?.charge || tactic?.family?.includes('charge')) return level('commit', 0.86);
	if (world.huntClock?.active) return level('huntPressure', 0.62);
	return level('pressure', 0.42);
}

function level(kind, value) {
	return { kind, value };
}
