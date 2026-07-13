//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the aggression escalation vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Aggression escalation.
 *
 * Chapter 67: if no damage is born, the arena gets impatient. The bot becomes
 * less interested in elegant pressure and more interested in closing distance,
 * rapid punches, and direct fighting.
 */
export function updateAggression(bot, world) {
	bot.aiMind ||= {};
	bot.aiMind.aggression ||= {
		noDamageFrames: 0,
		lastTargetDamage: world.target.damage,
		value: 1
	};
	const a = bot.aiMind.aggression;
	if (world.target.damage > a.lastTargetDamage) a.noDamageFrames = 0;
	else a.noDamageFrames++;
	a.lastTargetDamage = world.target.damage;
	a.value =
		a.noDamageFrames > 420
			? 2.15
			: a.noDamageFrames > 300
				? 1.75
				: a.noDamageFrames > 180
					? 1.35
					: 1;
	bot.aiMind.noHitFrames = a.noDamageFrames;
	return { value: a.value, noDamageFrames: a.noDamageFrames, hungry: a.value > 1.3 };
}

/**
 * Reveals the apply aggression behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} scores The scores value entering this behavior.
 * @param {*} aggression The aggression value entering this behavior.
 */
export function applyAggression(scores, aggression) {
	if (!aggression?.hungry) return scores;
	return {
		...scores,
		Chase: Math.round((scores.Chase || 0) * aggression.value + 24),
		LandingIntercept: Math.round(
			(scores.LandingIntercept || 0) * Math.min(1.25, aggression.value)
		),
		EdgePressure: Math.round((scores.EdgePressure || 0) / Math.min(1.8, aggression.value)),
		CenterControl: Math.round((scores.CenterControl || 0) * 0.55)
	};
}
