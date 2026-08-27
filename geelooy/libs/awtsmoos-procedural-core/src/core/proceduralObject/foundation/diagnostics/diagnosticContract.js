// B"H

/** Stable diagnostic severities, ordered from observation to execution stop. */
export const DIAGNOSTIC_SEVERITIES = Object.freeze([
	"info",
	"warning",
	"error",
	"fatal"
]);

/** Machine codes use namespaced uppercase segments and never depend on prose. */
export const DIAGNOSTIC_CODE_PATTERN = /^[A-Z][A-Z0-9]*(?:[._][A-Z0-9]+)*$/;

/** Returns whether a value is a legal diagnostic path segment. */
export function isDiagnosticPathSegment(value) {
	return typeof value === "string"
		|| (Number.isInteger(value) && value >= 0);
}
