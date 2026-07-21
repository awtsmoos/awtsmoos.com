// B"H

import { normalizeCanonicalValue } from "./normalizeCanonicalValue.js";

/**
 * Serializes a value through the canonical tagged language.
 *
 * The outward JSON becomes a faithful trace of inward distinctions: sorted,
 * explicit, replayable, and free of host-object shadows.
 */
export function serializeCanonicalValue(value, options = {}) {
	return JSON.stringify(normalizeCanonicalValue(value, options));
}
