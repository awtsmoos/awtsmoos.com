//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack intent metrics vessel in this instant, revealing
 * its focused js ai advanced test metrics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Attack intent metrics.
 *
 * Chapter 214: the simulator must not merely say “attacks happened.” It must
 * reveal whether the bot sought rapid pressure, charge death, upward launch,
 * horizontal exile, edge carry, and edgeguard punishment.
 */
export function createAttackIntentMetrics() {
	return {
		koIntents: {},
		attackFamilies: {},
		rapidAttempts: 0,
		chargeAttempts: 0,
		verticalKillAttempts: 0,
		horizontalKillAttempts: 0,
		edgeCarryAttempts: 0,
		edgeGuardAttempts: 0
	};
}

/**
 * Reveals the observe attack intent behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} report The report value entering this behavior.
 * @param {*} mind The mind value entering this behavior.
 */
export function observeAttackIntent(report, mind) {
	report.attackIntent ||= createAttackIntentMetrics();
	const intent = mind?.debug?.koIntent || mind?.koIntent?.name || 'none';
	const family =
		mind?.debug?.attackFamily || mind?.combatTactic?.family || mind?.tactic || 'none';
	count(report.attackIntent.koIntents, intent);
	count(report.attackIntent.attackFamilies, family);
	if (family === 'rapid' || mind?.tactic === 'RapidPunch') report.attackIntent.rapidAttempts++;
	if (
		family === 'chargePunch' ||
		family === 'chargeKick' ||
		String(mind?.tactic || '').includes('Charge')
	)
		report.attackIntent.chargeAttempts++;
	if (intent === 'VerticalKill' || intent === 'AntiAirKill')
		report.attackIntent.verticalKillAttempts++;
	if (intent === 'HorizontalKill') report.attackIntent.horizontalKillAttempts++;
	if (intent === 'EdgeCarry') report.attackIntent.edgeCarryAttempts++;
	if (intent === 'EdgeGuard') report.attackIntent.edgeGuardAttempts++;
}

function count(bucket, key) {
	bucket[key] = (bucket[key] || 0) + 1;
}
