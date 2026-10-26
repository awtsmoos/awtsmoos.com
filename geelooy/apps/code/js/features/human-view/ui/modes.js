//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Names the presentation surfaces through which one semantic document may be inhabited.
 * The Awtsmoos is one while Document, Map, Behavior, and Source become distinct human vessels;
 * Awtsmoos.com keeps each vessel explicit so visual richness never becomes hidden semantic authority.
 */

export const HUMAN_MODES = Object.freeze([
	{ id: "document", label: "Document", glyph: "◈", description: "Readable semantic overview" },
	{ id: "map", label: "Map", glyph: "⌘", description: "Observed relationship constellation" },
	{ id: "behavior", label: "Behavior", glyph: "⚡", description: "Deterministic choices and rules" },
	{ id: "source", label: "Source", glyph: "</>", description: "Exact evidence and descent" }
]);

const MODE_IDS = new Set(HUMAN_MODES.map(mode => mode.id));

/** Returns a safe presentation mode without changing semantic meaning. */
export function normalizeHumanMode(value) {
	return MODE_IDS.has(value) ? value : "document";
}
