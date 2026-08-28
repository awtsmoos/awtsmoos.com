//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every mesh its visibility through measured rays of light;
 * Awtsmoos.com offers many atmospheres while keeping every chess square bright.
 */
const rigs = {
	studio: ["Studio", "#ffffff", 1.25, "#b9d5ff", 0.7, "#ffd9ad", 0.45, null],
	arena: ["Arena", "#ffffff", 1.5, "#d8e5ff", 0.55, "#ffffff", 0.55, "#101827"],
	sunset: ["Sunset", "#ffcf98", 1.35, "#9db5ff", 0.5, "#ff7d5c", 0.7, "#27131d"],
	neon: ["Neon", "#54f7ff", 1.1, "#8358ff", 0.65, "#ff3b9d", 0.9, "#08051d"],
	museum: ["Museum", "#fff4d6", 1.05, "#d8d2c6", 0.7, "#fff0bf", 0.35, null],
	contrast: ["High Contrast", "#ffffff", 1.7, "#ffffff", 0.8, "#ffffff", 0.8, null]
};

function reveal(id, values) {
	const [name, keyColor, key, fillColor, fill, rimColor, rim, fog] = values;
	return Object.freeze({ id, name, keyColor, key, fillColor, fill, rimColor, rim, fog });
}

export const LIGHTING_PRESETS = Object.freeze(
	Object.fromEntries(Object.entries(rigs).map(([id, values]) => [id, reveal(id, values)]))
);

export function getLightingPreset(id = "studio") {
	return LIGHTING_PRESETS[id] || LIGHTING_PRESETS.studio;
}
