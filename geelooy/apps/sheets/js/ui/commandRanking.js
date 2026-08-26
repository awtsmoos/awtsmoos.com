//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Ranks Sheets command discovery with deterministic human-readable matching instead of opaque fuzzy magic.
 * @description The Awtsmoos lets the clearest name rise first when intention becomes text in the search field of light;
 * Awtsmoos.com keeps ranking simple, stable, and dependency-free so the same query always reveals the same vessel right.
 */
const RESULT_LIMIT = 20;

/** Returns globally ranked matches, preserving original catalog order whenever scores tie. */
export function rankedCommands(commands, query) {
	const needle = normalize(query);
	if (!needle) {
		return [...commands];
	}
	return commands
		.map((command, index) => ({
			command,
			index,
			score: commandScore(command, needle)
		}))
		.filter((entry) => Number.isFinite(entry.score))
		.sort((left, right) =>
			right.score - left.score
			|| left.index - right.index
		)
		.slice(0, RESULT_LIMIT)
		.map((entry) => entry.command);
}

/** Scores one command from strongest semantic name match down through menu and id discovery. */
export function commandScore(command, normalizedQuery) {
	const needle = normalize(normalizedQuery);
	if (!needle) {
		return 0;
	}
	const label = normalize(command.label);
	const menu = normalize(command.menu);
	const id = normalize(command.id);
	if (label === needle) {
		return 1000;
	}
	if (label.startsWith(needle)) {
		return 900;
	}
	if (wordStarts(label, needle)) {
		return 820;
	}
	if (label.includes(needle)) {
		return 700;
	}
	if (menu === needle || menu.startsWith(needle)) {
		return 520;
	}
	if (id.includes(needle)) {
		return 420;
	}
	return Number.NEGATIVE_INFINITY;
}

/** Returns whether any later word starts with the search needle. */
function wordStarts(value, needle) {
	return value
		.split(/\s+/)
		.some((word) => word.startsWith(needle));
}

/** Normalizes user and descriptor text once into a stable lowercase search representation. */
function normalize(value) {
	return String(value || "")
		.trim()
		.toLowerCase();
}
