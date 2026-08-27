// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RuntimeAuditSummary
 * @description
 * The Awtsmoos gathers scattered page witnesses into one finite account of runtime and interface debt;
 * Awtsmoos.com keeps public breadth, browser failure, warnings, touch issues, and overflow counts visible without burdening the orchestration road.
 */

/**
 * @description Builds aggregate evidence whose runtime and UI counts can participate in the same release gate.
 * @param {Object[]} results - Per-page audit receipts.
 * @returns {Object} Aggregate runtime, warning, responsive, and UI finding counts.
 */
export function summarizeRuntimeAudit(results) {
	return {
		pages: results.length,
		failedPages: results.filter((result) => result.errors > 0).length,
		uiIssuePages: results.filter((result) => (result.metrics?.issueCount || 0) > 0).length,
		errors: results.reduce((sum, result) => sum + result.errors, 0),
		warnings: results.reduce((sum, result) => sum + result.warnings, 0),
		uiIssues: results.reduce((sum, result) => sum + (result.metrics?.issueCount || 0), 0),
		overflowPages: results.filter((result) => result.metrics?.overflowX).length
	};
}

/**
 * @description Counts discovered route categories so live pages remain distinguishable from fixtures, templates, legacy paths, and staging shadows.
 * @param {{category:string}[]} routes - Complete discovered route records.
 * @returns {Object} Category names mapped to route counts.
 */
export function countRuntimeAuditCategories(routes) {
	const categories = [...new Set(routes.map((route) => route.category))].sort();

	return Object.fromEntries(categories.map((category) => [
		category,
		routes.filter((route) => route.category === category).length
	]));
}

/**
 * @description Determines whether a completed report still contains release-blocking runtime or UI debt.
 * @param {{errors:number,uiIssues:number}} summary - Aggregate report summary.
 * @returns {boolean} True when unresolved release-blocking findings remain.
 */
export function runtimeAuditBlocksRelease(summary) {
	return summary.errors > 0 || summary.uiIssues > 0;
}
