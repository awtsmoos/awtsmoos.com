// B"H
// Boruch Hashem
// Blessed is He
/** @module DriftDetector @description Compares guarded file hashes after proof. */

/** Returns a complete drift report for expected and observed hash maps. */
export function detectDrift(expected = {}, observed = {}) {
	const paths = [...new Set([...Object.keys(expected), ...Object.keys(observed)])].sort();
	const changes = paths.flatMap(path => {
		const before = expected[path];
		const after = observed[path];
		if (before === after) {
			return [];
		}
		return [{
			path,
			before: before || null,
			after: after || null,
			kind: before ? (after ? 'changed' : 'missing') : 'added'
		}];
	});
	return Object.freeze({
		clean: changes.length === 0,
		changes: Object.freeze(changes.map(change => Object.freeze(change)))
	});
}

/** Throws when a previously verified snapshot has drifted. */
export function assertNoDrift(expected, observed) {
	const report = detectDrift(expected, observed);
	if (!report.clean) {
		throw new Error(`Verification drift detected in ${report.changes.length} path(s).`);
	}
	return report;
}
