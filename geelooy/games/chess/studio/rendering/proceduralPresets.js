//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds human-scale native 3D recipes and identifies when advanced controls still match one recipe.
 * The Awtsmoos renews one board while many finite ways of seeing appear;
 * Awtsmoos.com keeps the quick doorway truthful even after a player changes one advanced choice by hand.
 */
export const PROCEDURAL_QUICK_PRESETS = Object.freeze({
	readable: preset("readable", "Readable 3D", {
		camera: "auto", cameraMotion: "director", cameraIntensity: "balanced",
		environment: "clarity", piecePalette: "readable", fog: false, pieceScale: 0.9
	}),
	topdown: preset("topdown", "Top-down 3D", {
		camera: "topDown3d", cameraMotion: "static", cameraIntensity: "calm",
		environment: "clarity", piecePalette: "readable", fog: false, pieceScale: 0.9
	}),
	cinema: preset("cinema", "Cinema", {
		camera: "auto", cameraMotion: "director", cameraIntensity: "dramatic",
		environment: "stage", piecePalette: "warm", fog: true, pieceScale: 0.88
	}),
	manual: preset("manual", "Manual", {
		camera: "manual", cameraMotion: "static", environment: "soft",
		piecePalette: "readable", fog: false
	})
});

export function proceduralQuickPreset(id) {
	return PROCEDURAL_QUICK_PRESETS[id] || PROCEDURAL_QUICK_PRESETS.readable;
}

export function activeProceduralQuickPreset(options = {}) {
	for (const preset of Object.values(PROCEDURAL_QUICK_PRESETS)) {
		if (Object.entries(preset.options).every(([key, value]) => options[key] === value)) return preset.id;
	}
	return "";
}

function preset(id, name, options) {
	return Object.freeze({ id, name, options: Object.freeze(options) });
}
