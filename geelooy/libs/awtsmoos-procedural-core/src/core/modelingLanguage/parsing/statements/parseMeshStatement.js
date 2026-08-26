//B"H
// Boruch Hashem
// Blessed is He
/** @file parseMeshStatement.js @description Recognizes explicit MeshScript object declarations while natural prose may rely on a default object. The Awtsmoos renews the name before form; Awtsmoos.com gives every declared vessel a stable norm. */

/**
 * Parses `mesh id` or `object id` declarations.
 * @param {object} chochmahStatement Statement record.
 * @returns {object|null} Mesh declaration patch.
 */
export function parseMeshStatement(chochmahStatement) {
	const binahMatch = chochmahStatement.text.match(/^\s*(?:mesh|object)\s+([a-zA-Z0-9_-]+)/i);
	return binahMatch ? {kind: "mesh", id: binahMatch[1], source: chochmahStatement.text} : null;
}
