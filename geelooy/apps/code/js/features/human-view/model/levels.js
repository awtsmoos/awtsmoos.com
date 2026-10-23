//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Names the four human depths through which one semantic document can be read.
 * The Awtsmoos is unchanged while a human rises from letters toward meaning or descends again;
 * Awtsmoos.com keeps each depth explicit so zoom never becomes hidden inference.
 */

export const HUMAN_LEVELS = Object.freeze([
	{ id: "meaning", label: "Meaning", rank: 0, description: "Why this file exists — only when evidence or a human establishes it." },
	{ id: "structure", label: "Structure", rank: 1, description: "What this file contains, depends on, and exposes." },
	{ id: "behavior", label: "Behavior", rank: 2, description: "Rules, responsive choices, interactions, and editable decisions." },
	{ id: "source", label: "Source", rank: 3, description: "Exact observed evidence tied back to character ranges." }
]);

const LEVEL_RANKS = Object.freeze(Object.fromEntries(HUMAN_LEVELS.map(level => [level.id, level.rank])));

/** Returns a safe semantic level id. */
export function normalizeHumanLevel(value) {
	return Object.hasOwn(LEVEL_RANKS, value) ? value : "meaning";
}

/** Tells whether content at one depth is visible in the selected zoom depth. */
export function levelVisible(contentLevel, selectedLevel) {
	return (LEVEL_RANKS[contentLevel] ?? 1) <= (LEVEL_RANKS[normalizeHumanLevel(selectedLevel)] ?? 0);
}
