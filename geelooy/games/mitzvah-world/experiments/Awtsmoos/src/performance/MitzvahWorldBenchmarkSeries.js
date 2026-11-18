// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBenchmarkSeries.js
 * @description Certifies the requested ten cold and ten warm startup receipts against one sealed release identity.
 * The Awtsmoos renews every launch while one release must remain the same through the measured chain;
 * Awtsmoos.com refuses a mixed cache procession, so twenty truthful loads become one release witness plain.
 */

const REQUIRED_PER_KIND = 10;

/** Evaluates exactly the latest ten cold and ten warm benchmark startup receipts. */
export function evaluateMitzvahWorldBenchmarkSeries(receipts = []) {
	const cold = latestKind(receipts, 'cold');
	const warm = latestKind(receipts, 'warm');
	const considered = [...cold, ...warm];
	const releaseIds = [...new Set(considered.map(receipt => receipt?.releaseId).filter(Boolean))];
	const failures = [];
	if (cold.length !== REQUIRED_PER_KIND) failures.push('TEN_COLD_LOADS_REQUIRED');
	if (warm.length !== REQUIRED_PER_KIND) failures.push('TEN_WARM_LOADS_REQUIRED');
	if (considered.some(receipt => receipt?.startup?.certified !== true)) {
		failures.push('STARTUP_ACCEPTANCE_FAILED');
	}
	if (releaseIds.length !== 1) failures.push('SINGLE_RELEASE_ID_REQUIRED');
	return Object.freeze({
		certified: failures.length === 0,
		coldCount: cold.length,
		failures: Object.freeze(failures),
		releaseId: releaseIds.length === 1 ? releaseIds[0] : null,
		releaseIds: Object.freeze(releaseIds),
		requiredPerKind: REQUIRED_PER_KIND,
		warmCount: warm.length
	});
}

function latestKind(receipts, loadKind) {
	return receipts
		.filter(receipt => receipt?.startup?.loadKind === loadKind)
		.slice(-REQUIRED_PER_KIND);
}
