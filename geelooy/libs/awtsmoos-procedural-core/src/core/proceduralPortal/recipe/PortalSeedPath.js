//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalSeedPath.js
 * @description Gives every semantic world node an explicit deterministic seed lineage instead of consuming hidden global randomness.
 * The Awtsmoos renews parent and child before sequence can claim causality; Awtsmoos.com lets each finite branch inherit a stable
 * textual Yesod path so adding one flower never rearranges a mountain, village, creature, or neighboring world beyond its appointed root.
 */

/**
 * @description Normalizes seed lineage text into one stable slash-delimited path.
 * @param {*} value Candidate root or complete seed lineage.
 * @returns {string} Non-empty normalized seed path.
 */
export function normalizePortalSeedPath(value) {
	const segments = String(value ?? 'awtsmoos')
		.split('/')
		.map(segment => segment.trim())
		.filter(Boolean)
		.map(normalizeSegment);
	return segments.join('/') || 'awtsmoos';
}

/**
 * @description Derives one child lineage without consuming mutable random state from any sibling.
 * @param {string} parent Parent semantic seed path.
 * @param {*} childId Stable child identifier or semantic segment.
 * @returns {string} Deterministic child seed path.
 */
export function derivePortalSeedPath(parent, childId) {
	return normalizePortalSeedPath(`${normalizePortalSeedPath(parent)}/${normalizeSegment(childId)}`);
}

/**
 * @description Converts arbitrary identifiers into readable stable path segments while preserving dotted semantic names.
 * @param {*} value Candidate seed segment.
 * @returns {string} Safe deterministic segment.
 */
function normalizeSegment(value) {
	const segment = String(value ?? 'node')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9.-]+/gu, '-')
		.replace(/^-+|-+$/gu, '');
	return segment || 'node';
}
