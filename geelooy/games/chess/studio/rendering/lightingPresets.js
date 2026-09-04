//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines native lighting rigs, including a restrained mobile readability vessel.
 * The Awtsmoos gives every finite mesh its visibility through measured rays rather than glare;
 * Awtsmoos.com lets cinema burn brighter only when the player asks, while ordinary chess remains clear.
 */
const rigs = {
	readability: ["Readable", "#efe9dd", 0.78, "#b7c5d4", 0.38, "#d5dde8", 0.18, null],
	studio: ["Studio", "#ffffff", 1.25, "#b9d5ff", 0.7, "#ffd9ad", 0.45, null],
	arena: ["Arena", "#ffffff", 1.5, "#d8e5ff", 0.55, "#ffffff", 0.55, "#101827"],
	sunset: ["Sunset", "#ffcf98", 1.35, "#9db5ff", 0.5, "#ff7d5c", 0.7, "#27131d"],
	neon: ["Neon", "#54f7ff", 1.1, "#8358ff", 0.65, "#ff3b9d", 0.9, "#08051d"],
	museum: ["Museum", "#fff4d6", 1.05, "#d8d2c6", 0.7, "#fff0bf", 0.35, null],
	contrast: ["High Contrast", "#ffffff", 1.7, "#ffffff", 0.8, "#ffffff", 0.8, null]
};

/** @param {string} id Rig id. @param {Array} values Compact rig tuple. @returns {Readonly<object>} Expanded rig. */
function reveal(id, values) {
	const [name, keyColor, key, fillColor, fill, rimColor, rim, fog] = values;
	return Object.freeze({ id, name, keyColor, key, fillColor, fill, rimColor, rim, fog });
}

export const LIGHTING_PRESETS = Object.freeze(
	Object.fromEntries(Object.entries(rigs).map(([id, values]) => [id, reveal(id, values)]))
);

/** @param {string} [id="readability"] Requested rig. @returns {Readonly<object>} Lighting descriptor. */
export function getLightingPreset(id = "readability") {
	return LIGHTING_PRESETS[id] || LIGHTING_PRESETS.readability;
}
