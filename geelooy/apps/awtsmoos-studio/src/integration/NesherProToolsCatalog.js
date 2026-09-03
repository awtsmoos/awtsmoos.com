//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NesherProToolsCatalog.js
 * @description Names the professional Nesher capabilities surfaced inside unified Awtsmoos Studio without importing Nesher into first paint.
 * The Awtsmoos lets many deep instruments remain one ordered constellation around the maker's central movie;
 * Awtsmoos.com gives every tool a stable name and doorway so implementations may evolve while intention stays groovy.
 */
const NESHER_PRO_TOOLS = Object.freeze([
	tool('stage', 'Stage Pro', '#stageWorkstation', 'Inspect transforms, crop, layers, scenes, and size.'),
	tool('recording', 'Recording', '#recordButton', 'Capture the composed movie with recording profiles.'),
	tool('sources', 'Sources', '#sourcesSection', 'Add files, camera, display, browser, audio, and visualizer sources.'),
	tool('timeline', 'Timeline', '#nleSection', 'Arrange clips, trim, split, move, and prepare export.'),
	tool('audio', 'Audio Lab', '#audioLabSection', 'Shape sound-driven visuals and live audio analysis.'),
	tool('live', 'Live', '#streamSection', 'Open live and HLS streaming controls.'),
	tool('setup', 'Setup', '#studioSettings', 'Configure providers and deeper Studio connections.'),
	tool('commands', 'Commands', '#moreSection', 'Use Creative Language commands, history, macros, and presets.')
]);

/** Returns the complete immutable professional-tool catalog. */
export function listNesherProTools() {
	return NESHER_PRO_TOOLS;
}

/**
 * Resolves one professional tool by stable capability identity.
 * @param {string} toolId Stable tool identity.
 * @returns {object} Tool definition.
 */
export function getNesherProTool(toolId) {
	const entry = NESHER_PRO_TOOLS.find((candidate) => {
		return candidate.id === toolId;
	});

	if (!entry) {
		throw new Error(`Unknown Nesher Pro Tool: ${toolId}.`);
	}

	return entry;
}

/** Creates one immutable catalog entry. */
function tool(id, label, hash, description) {
	return Object.freeze({
		id,
		label,
		hash,
		description
	});
}
