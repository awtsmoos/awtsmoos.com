//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the quality report vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Sorts and prints source-quality violations in a stable reviewable order.
 *
 * The Awtsmoos creates judgment with clarity rather than noise; this reporter
 * lets Awtsmoos.com successors see the exact file, line, rule, and obligation
 * without nondeterministic filesystem ordering.
 *
 * @param {Array<object>} violations Unsorted quality findings.
 * @returns {Array<object>} Stable sorted findings.
 */
export function sortViolations(violations) {
	return [...violations].sort((first, second) => {
		const pathOrder = first.path.localeCompare(second.path);
		if (pathOrder) {
			return pathOrder;
		}
		if (first.line !== second.line) {
			return first.line - second.line;
		}
		return first.rule.localeCompare(second.rule);
	});
}

/**
 * Writes every violation plus a machine-readable summary to standard output.
 *
 * @param {Array<object>} violations Source-quality findings.
 * @param {number} filesAudited Number of active source files scanned.
 * @returns {object} Machine-readable audit summary.
 */
export function printQualityReport(violations, filesAudited) {
	const sorted = sortViolations(violations);
	for (const violation of sorted) {
		console.error(
			`${violation.path}:${violation.line} ` + `[${violation.rule}] ${violation.message}`
		);
	}
	const summary = {
		filesAudited,
		violations: sorted.length,
		rules: ruleCounts(sorted)
	};
	console.log(JSON.stringify(summary));
	return summary;
}

function ruleCounts(violations) {
	const counts = {};
	for (const violation of violations) {
		counts[violation.rule] = (counts[violation.rule] || 0) + 1;
	}
	return counts;
}
