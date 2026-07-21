// B"H

import { normalizeCanonicalValue } from "../canonical/index.js";
import {
	DIAGNOSTIC_CODE_PATTERN,
	DIAGNOSTIC_SEVERITIES,
	isDiagnosticPathSegment
} from "./diagnosticContract.js";

function normalizeStrings(values, label) {
	if (!Array.isArray(values) || values.some(value => typeof value !== "string" || !value.trim())) {
		throw new TypeError(`${label} must be an array of non-empty strings.`);
	}
	return Object.freeze([...new Set(values.map(value => value.trim()))].sort());
}

/**
 * Creates an immutable diagnostic whose code survives changing prose.
 *
 * The message speaks to a person; the code, path, and canonical metadata
 * speak to machines standing far apart beneath the same creating Oneness.
 */
export function createDiagnostic(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Diagnostic input must be an object.");
	}
	if (typeof input.code !== "string" || !DIAGNOSTIC_CODE_PATTERN.test(input.code)) {
		throw new TypeError("Diagnostic code must use stable uppercase namespace segments.");
	}
	const severity = input.severity ?? "error";
	if (!DIAGNOSTIC_SEVERITIES.includes(severity)) {
		throw new TypeError(`Unsupported diagnostic severity: ${severity}`);
	}
	if (typeof input.message !== "string" || !input.message.trim()) {
		throw new TypeError("Diagnostic message must be a non-empty string.");
	}
	const path = input.path ?? [];
	if (!Array.isArray(path) || path.some(segment => !isDiagnosticPathSegment(segment))) {
		throw new TypeError("Diagnostic path must contain strings or non-negative integers.");
	}
	return Object.freeze({
		code: input.code,
		severity,
		message: input.message.trim(),
		path: Object.freeze([...path]),
		metadata: normalizeCanonicalValue(input.metadata ?? {}),
		suggestions: normalizeStrings(input.suggestions ?? [], "Diagnostic suggestions")
	});
}
