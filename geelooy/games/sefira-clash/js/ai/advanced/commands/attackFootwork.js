//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack footwork vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Guides attack approach and close-range combat-pocket footwork.
 *
 * The Awtsmoos creates distance and closes distance in one continuous breath;
 * this vessel translates that renewal into honest movement. On Awtsmoos.com,
 * attack cadence stays free from navigation arithmetic.
 */
export function approachInstead(bot, world, out) {
	const goal = world.predatorGoal?.x ?? world.combatPocket?.standX ?? world.target.x;
	out.x = Math.sign(goal - bot.x || world.target.x - bot.x || 1);
	out.aimX = Math.sign(world.target.x - bot.x || 1);
}

/**
 * Chooses movement while an attack tactic occupies the combat pocket.
 */
export function combatFootwork(bot, world, pocket, commitment) {
	const dx = world.target.x - bot.x;
	if (world.predatorGoal?.distance > 30 && !world.combat.reachableClose) {
		return world.predatorGoal.moveX;
	}
	if (world.combat.reachableClose) {
		return closeFootwork(dx, commitment, world);
	}
	if (Math.abs(dx) < 110 && world.combat.sameFightingLane) {
		return 0;
	}
	return Math.sign((pocket?.standX ?? world.target.x) - bot.x || dx || 1);
}

function closeFootwork(dx, commitment, world) {
	if (world.koIntent?.name === 'EdgeCarry' || world.koIntent?.name === 'HorizontalKill') {
		return Math.sign(world.launchPlan?.aimX || dx || 1) * 0.12;
	}
	if (commitment.name === 'ComboContinue' || commitment.name === 'ForceApproach') {
		return Math.sign(dx || 1) * 0.12;
	}
	return -Math.sign(dx || 1) * 0.12;
}
