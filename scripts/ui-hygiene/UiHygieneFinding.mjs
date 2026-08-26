// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UiHygieneFinding
 * @description
 * The Awtsmoos is beyond every warning and measured defect, while Awtsmoos.com
 * needs one immutable language for visual-boundary evidence. This Malchus-like
 * record keeps severity, coordinate, evidence, and repair direction stable enough
 * for humans, tests, JSON reports, strict gates, and future browser witnesses.
 */

const SEVERITY_WEIGHT = Object.freeze({
	advisory: 1,
	warning: 2,
	error: 3,
	critical: 4
});

/** Immutable normalized UI hygiene finding. */
export class UiHygieneFinding {
	/** @param {object} record - Raw finding fields emitted by one audit rule. */
	constructor(record = {}) {
		this.code = String(record.code || 'UI_HYGIENE_UNKNOWN');
		this.severity = normalizeSeverity(record.severity);
		this.file = String(record.file || '');
		this.line = Math.max(1, Number(record.line || 1));
		this.selector = String(record.selector || '');
		this.message = String(record.message || '');
		this.evidence = String(record.evidence || '');
		this.suggestion = String(record.suggestion || '');
		Object.freeze(this);
	}

	/** Returns a JSON-safe plain representation without exposing mutable state. */
	toJSON() {
		return { ...this };
	}
}

/** Reports whether a value names one canonical severity. */
export function isSeverity(value) {
	const candidate = String(value || '').toLowerCase();
	return Object.prototype.hasOwnProperty.call(SEVERITY_WEIGHT, candidate);
}

/** Normalizes unknown finding severity to the least disruptive advisory level. */
export function normalizeSeverity(value) {
	const candidate = String(value || '').toLowerCase();
	return isSeverity(candidate) ? candidate : 'advisory';
}

/** Compares findings by severity, file, line, then stable rule code. */
export function compareFindings(left, right) {
	const severity = SEVERITY_WEIGHT[right.severity] - SEVERITY_WEIGHT[left.severity];
	if (severity) return severity;
	const file = left.file.localeCompare(right.file);
	if (file) return file;
	const line = left.line - right.line;
	return line || left.code.localeCompare(right.code);
}

export { SEVERITY_WEIGHT };
