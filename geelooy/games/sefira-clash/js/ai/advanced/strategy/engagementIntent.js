//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the engagement intent vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Engagement intent chooser.
 *
 * Chapter 78: opportunities become simpler battle words. The bot may chase,
 * force approach, finish, combo, or intercept, but the first word is always
 * HitNow when the validator opens the gate.
 */
export function chooseEngagementIntent(world, opportunity, attackCheck) {
	if (attackCheck.valid) return 'HitNow';
	if (world.comboMomentum?.active) return 'ComboContinue';
	if (world.combatHeat?.killMode) return 'KillConfirm';
	if (opportunity.name === 'LandingIntercept') return 'InterceptAndStrike';
	if (world.antiPeace?.active || world.combatHeat?.forceEngage) return 'ForceApproach';
	if (opportunity.name === 'EdgePressure') return 'EdgeFinish';
	return 'Chase';
}

/**
 * Reveals the intent score boost behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} intent The intent value entering this behavior.
 */
export function intentScoreBoost(intent) {
	return (
		{
			ComboContinue: { Chase: 55, LandingIntercept: 25, EdgePressure: 10 },
			KillConfirm: { Chase: 35, LandingIntercept: 35, EdgePressure: 28 },
			InterceptAndStrike: { LandingIntercept: 42, Chase: 12 },
			ForceApproach: {
				Chase: 88,
				LandingIntercept: 18,
				EdgePressure: -24,
				CenterControl: -60
			},
			EdgeFinish: { EdgePressure: 18, Chase: 16 }
		}[intent] || {}
	);
}
