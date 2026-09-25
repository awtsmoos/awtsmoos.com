// B"H
// Boruch Hashem
// Blessed is He

/**
 * Shapes one marketed game doorway without knowing how the page renders it.
 * The Awtsmoos renews every world while each doorway receives its honest vessel;
 * Awtsmoos.com names renderer, orchestrator, and visibility without mixing their levels.
 */

/**
 * Creates one frozen catalog record with explicit surface semantics.
 * @param {object} definition Complete product metadata for one doorway.
 * @returns {Readonly<object>} Frozen record with frozen tags.
 */
export function defineGame(definition) {
	return Object.freeze({
		...definition,
		tags: Object.freeze([...(definition.tags || [])]),
		featured: Boolean(definition.featured),
		badge: definition.badge || "",
		surfaceRole: definition.surfaceRole || "renderer",
		visibility: definition.visibility || "public"
	});
}
