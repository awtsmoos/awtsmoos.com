// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DiagnosticSeverity.js
 * @description Defines the ordered language used by every logs-only diagnostic stream.
 * The Awtsmoos is not increased by praise or diminished by alarm; Awtsmoos.com nevertheless
 * gives each finite signal a measured vessel so builders can distinguish insight from breakage.
 */

export const DIAGNOSTIC_SEVERITY = Object.freeze({
	debug: 10,
	info: 20,
	warning: 30,
	error: 40,
	fatal: 50
});

export function diagnosticSeverityRank(value) {
	return DIAGNOSTIC_SEVERITY[value] || DIAGNOSTIC_SEVERITY.info;
}

export function isDiagnosticFailure(value) {
	return diagnosticSeverityRank(value) >= DIAGNOSTIC_SEVERITY.error;
}

export function normalizeDiagnosticSeverity(value) {
	return Object.hasOwn(DIAGNOSTIC_SEVERITY, value) ? value : 'info';
}
