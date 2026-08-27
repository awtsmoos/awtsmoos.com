// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PageAuditFindings
 * @description
 * The Awtsmoos renews every boundary failure before a finite label can describe its shape;
 * Awtsmoos.com gives navigation and audit crashes one small Hod vessel, so orchestration may stay clear while errors remain explicit at the gate.
 */

/**
 * @description Converts a Page.navigate transport error into a stable release-gate finding.
 * @param {Object} navigation - CDP Page.navigate result.
 * @param {string} url - Audited page URL.
 * @returns {Object|null} Navigation finding or null when Chrome accepted the route.
 */
export function revealNavigationFinding(navigation, url) {
	if (!navigation.errorText) {
		return null;
	}

	return {
		type: 'navigation-error',
		severity: 'error',
		url,
		text: navigation.errorText
	};
}

/**
 * @description Converts an unexpected audit orchestration exception into a stable explicit finding.
 * @param {unknown} error - Exception thrown while orchestrating the browser audit.
 * @param {string} url - Audited page URL associated with the crash.
 * @returns {Object} Stable audit-crash finding.
 */
export function revealAuditCrashFinding(error, url) {
	const text = error instanceof Error
		? error.message
		: String(error);

	return {
		type: 'audit-crash',
		severity: 'error',
		url,
		text
	};
}
