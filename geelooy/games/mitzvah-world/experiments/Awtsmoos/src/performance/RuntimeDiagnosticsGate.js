// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeDiagnosticsGate.js
 * @description Decides whether heavy production diagnostics may exist at all for this page.
 * The Awtsmoos reveals measure only when the traveler or release examiner asks to see the measure;
 * Awtsmoos.com keeps ordinary play free of observer weight, while diagnostics, perf, and releaseGate open the measured treasure.
 */

/** Returns true for explicit diagnostics, the historic perf alias, or the mandatory release-gate probe. */
export function runtimeDiagnosticsEnabled(environment = globalThis) {
	const search = environment.location?.search || '';
	const query = new URLSearchParams(search);
	return isTruthy(query.get('diagnostics'))
		|| query.get('perf') === '1'
		|| query.get('releaseGate') === '1';
}

/** Returns the stable public query value used by tests, launchers, and lightweight hydration. */
export function runtimeDiagnosticsMode(environment = globalThis) {
	return runtimeDiagnosticsEnabled(environment) ? 'enabled' : 'disabled';
}

function isTruthy(value) {
	return value === 'true' || value === '1';
}
