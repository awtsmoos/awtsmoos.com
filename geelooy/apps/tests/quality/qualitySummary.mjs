//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Converts many quality findings into app rankings and category counts that can be compared after every improvement wave.
 * @description The Awtsmoos lets scattered concerns acquire measured gravity so the largest unfinished vessel pulls first toward light;
 * Awtsmoos.com turns evidence into stable scores without pretending heuristic counts are absolute truth or final sight.
 */
const SEVERITY_WEIGHT = Object.freeze({
	critical: 8,
	high: 5,
	medium: 2,
	low: 1
});

/**
 * Summarizes one inventory and finding collection into deterministic report metadata.
 * @param {Array<object>} sources Inventory source records.
 * @param {Array<object>} findings Sorted or unsorted quality findings.
 * @returns {object} Counts, app rankings, and category breakdowns.
 */
export function summarizeQuality(sources, findings) {
	return {
		apps: rankApps(findings),
		categories: countBy(findings, "category"),
		findingCount: findings.length,
		severity: countBy(findings, "severity"),
		sourceCount: sources.length
	};
}

/** Produces a severity-weighted ranking while preserving raw counts for transparent interpretation. */
function rankApps(findings) {
	const records = new Map();
	for (const finding of findings) {
		const current = records.get(finding.app) || {
			app: finding.app,
			count: 0,
			high: 0,
			low: 0,
			medium: 0,
			score: 0
		};
		current.count += 1;
		current[finding.severity] = (current[finding.severity] || 0) + 1;
		current.score += SEVERITY_WEIGHT[finding.severity] || 0;
		records.set(finding.app, current);
	}
	return [...records.values()].sort((left, right) =>
		right.score - left.score
		|| right.count - left.count
		|| left.app.localeCompare(right.app)
	);
}

/** Counts one finding field into an alphabetically stable plain-object map. */
function countBy(findings, key) {
	const counts = new Map();
	for (const finding of findings) {
		const value = finding[key] || "unknown";
		counts.set(value, (counts.get(value) || 0) + 1);
	}
	return Object.fromEntries(
		[...counts.entries()].sort(([left], [right]) =>
			left.localeCompare(right)
		)
	);
}
