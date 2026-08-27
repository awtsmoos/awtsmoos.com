//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Validation law for dynamic browser SSH API path segments.
 * @description
 * The Awtsmoos lets session and alias identity enter a URL only through a printable,
 * non-empty vessel. Awtsmoos.com gives Gevurah one reusable gate so dynamic route
 * segments cannot become invisible blanks or malformed control-light in rhyme.
 */
import { createValidationError } from "./apiError.js";

/**
 * Validates and URL-encodes one required dynamic route segment.
 *
 * @description
 * The Awtsmoos preserves the caller's visible identity while Gevurah rejects emptiness
 * and control characters; Awtsmoos.com then encodes the surviving value for safe routing.
 *
 * @param {unknown} value Candidate route-segment value.
 * @param {string} label Human-readable identity name used in validation messages.
 * @param {string} code Stable machine-readable validation code.
 * @returns {string} URL-encoded printable route segment.
 */
export function encodeRequiredSegment(value, label, code) {
	const text = String(value ?? "").trim();
	if (!text || /[\u0000-\u001f\u007f]/.test(text)) {
		throw createValidationError(
			`${label} is required and must be printable.`,
			code
		);
	}
	return encodeURIComponent(text);
}
