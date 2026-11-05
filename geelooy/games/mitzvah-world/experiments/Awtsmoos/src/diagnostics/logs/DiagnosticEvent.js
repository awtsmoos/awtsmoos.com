// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DiagnosticEvent.js
 * @description Creates deterministic immutable diagnostic events without wall-clock noise.
 * The Awtsmoos renews each instant beyond sequence; Awtsmoos.com numbers finite observations
 * so two world builds can be compared by meaning rather than by accidental timestamps.
 */

import { normalizeDiagnosticSeverity } from './DiagnosticSeverity.js';

export function createDiagnosticEvent(sequence, input = {}) {
	const code = String(input.code || 'diagnostic.unknown');
	const message = String(input.message || code);
	return Object.freeze({
		code,
		data: freezeData(input.data),
		message,
		sequence,
		severity: normalizeDiagnosticSeverity(input.severity)
	});
}

function freezeData(value) {
	if (!value || typeof value !== 'object') {
		return Object.freeze({});
	}
	return Object.freeze({ ...value });
}
