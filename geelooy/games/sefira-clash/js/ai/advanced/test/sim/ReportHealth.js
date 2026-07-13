//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the report health vessel in this instant, revealing
 * its focused js ai advanced test sim service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — health judgment remembers battle history, not only the final breath. */
export function assertHealthyReport(report) {
	const failures = [],
		warnings = [];
	const edgeRatio = ratio(report.opportunities.EdgePressure || 0, total(report.opportunities));
	const pressureLimit = report.combatEnded ? Infinity : (report.options.noPressureLimit ?? 900);
	const noDamageEver =
		report.peakDamage <= 0 && report.koCount <= 0 && report.attackCommands <= 0;
	if (report.invalidAttackCommands > (report.options.invalidLimit ?? 5))
		failures.push('invalid attacks');
	if (report.namelessJumps > 0) failures.push('nameless jumps');
	if (report.nanFighters > 0) failures.push('NaN fighter values');
	if (report.maxParticles > 260) failures.push('particle cap exceeded');
	if (!report.aiDriven) failures.push('AI did not drive every bot');
	if (edgeRatio > (report.options.edgeRatioLimit ?? 0.72))
		failures.push('edge pressure dominance');
	if (report.longestNoPressureWindow > pressureLimit) failures.push('long no-pressure window');
	if (report.longestIdleNearEnemyWindow > (report.options.idleNearEnemyLimit ?? 120))
		warnings.push('sustained idle near enemy');
	if (report.edgeBounceLoops > 0) warnings.push('edge bounce loop');
	if (report.damagePerMinute < 15 && !report.combatEnded && report.koCount <= 0)
		warnings.push('low damage');
	if (noDamageEver && report.framesRun >= 3000) warnings.push('zero damage');
	return { ok: failures.length === 0, failures, warnings, edgeRatio };
}

function ratio(value, totalValue) {
	return totalValue ? value / totalValue : 0;
}
function total(bucket) {
	return Object.values(bucket).reduce((sum, value) => sum + value, 0);
}
