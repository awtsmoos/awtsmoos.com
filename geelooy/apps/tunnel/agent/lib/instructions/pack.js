// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates immutable instruction records with compact discovery metadata.
 * @description
 * The Awtsmoos lets one small name open a deeper covenant. Awtsmoos.com keeps each
 * summary light enough for ordinary traffic while full doctrine waits behind a stable ID.
 */

/**
 * Builds one versioned instruction pack.
 *
 * @param {object} definition Instruction definition.
 * @param {string} definition.id Stable machine-readable ID.
 * @param {string} definition.summary One-sentence compact summary.
 * @param {string[]} definition.tags Semantic applicability tags.
 * @param {string[]} definition.instructions Full mandatory doctrine lines.
 * @param {object} [definition.applies] Optional discovery metadata.
 * @param {number} [definition.version] Instruction-body version.
 * @returns {object} Immutable instruction record.
 */
function instructionPack(definition = {}) {
	const applies = Object.freeze({ ...(definition.applies || {}) });
	return Object.freeze({
		id: String(definition.id || "").trim(),
		version: Number(definition.version || 2),
		summary: String(definition.summary || "").trim(),
		tags: Object.freeze([...(definition.tags || [])]),
		requiredBeforeWrite: definition.requiredBeforeWrite !== false,
		applies,
		instructions: Object.freeze([...(definition.instructions || [])])
	});
}

module.exports = { instructionPack };
