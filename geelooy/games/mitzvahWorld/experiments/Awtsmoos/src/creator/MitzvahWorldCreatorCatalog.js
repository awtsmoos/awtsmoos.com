// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorCatalog.js
 * @description Defines the small data-first vocabulary from which live creator geometry and economic cost are revealed.
 * The Awtsmoos gives infinite possibility through finite letters; Awtsmoos.com lets timber, stone, glass,
 * brass, and course markers remain plain data so UI, economy, physics, sharing, and Studio can read one truth.
 */

const CREATOR_CATALOG = Object.freeze([
	creatorPart('timber-wall', 'Timber wall', '🪵', 'wood-log', '#8d6a45', { x: 2, y: 2, z: 0.45 }, false),
	creatorPart('stone-platform', 'Stone platform', '🪨', 'stone-block', '#767b80', { x: 2.4, y: 0.45, z: 2.4 }, true),
	creatorPart('glass-panel', 'Glass panel', '◇', 'glass-pane', '#8ed8e8', { x: 2, y: 2, z: 0.22 }, false),
	creatorPart('brass-beam', 'Brass beam', '⚙', 'brass-brace', '#b88a3d', { x: 3, y: 0.34, z: 0.34 }, true),
	creatorPart('course-marker', 'Course marker', '🚩', 'course-marker', '#e36b52', { x: 0.65, y: 1.5, z: 0.65 }, false)
]);

/**
 * Creates one immutable creator catalog entry without renderer-specific state.
 * @param {string} id Stable creator identity.
 * @param {string} label Human-readable material name.
 * @param {string} icon Compact visual glyph.
 * @param {string} itemId Authoritative inventory item consumed per placement.
 * @param {string} color Primitive fallback color.
 * @param {object} size Default world-space primitive dimensions.
 * @param {boolean} walkable Whether collision should be treated as floor-capable.
 * @returns {Readonly<object>} Frozen creator definition template.
 */
function creatorPart(id, label, icon, itemId, color, size, walkable) {
	return Object.freeze({
		color,
		cost: 1,
		icon,
		id,
		itemId,
		label,
		shape: 'box',
		size: Object.freeze({ ...size }),
		walkable
	});
}

/** Returns the immutable ordered creator catalog used by both rail UI and session logic. */
export function mitzvahWorldCreatorCatalog() {
	return CREATOR_CATALOG;
}

/**
 * Resolves one creator entry or throws a deterministic domain error.
 * @param {string} id Creator catalog identity.
 * @returns {Readonly<object>} Matching immutable creator entry.
 */
export function mitzvahWorldCreatorPart(id) {
	const binah = CREATOR_CATALOG.find(candidateKli => candidateKli.id === id);
	if (!binah) {
		throw new Error(`CREATOR_PART_UNKNOWN:${id}`);
	}
	return binah;
}
