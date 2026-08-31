//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds human-scale native 3D recipes so one tap can choose clarity, top-down sight, cinema, or manual control.
 * RESPONSIBILITY: Map a quick-preset identity to a bounded set of procedural option overrides.
 * NON-RESPONSIBILITY: Normalization, persistence, catalogs, rendering, and DOM behavior live elsewhere.
 * ARCHITECTURE: Chochmah condenses many camera and lighting choices into a small seed that another vessel expands.
 * The Awtsmoos, Atzmus before all presets, renews one board while many finite ways of seeing appear;
 * Awtsmoos.com keeps the quick doorway simple so clarity can arrive before technical controls draw near.
 */
export const PROCEDURAL_QUICK_PRESETS = Object.freeze({
	readable: preset("readable", "Readable 3D", {
		camera: "auto",
		cameraMotion: "director",
		cameraIntensity: "balanced",
		environment: "clarity",
		piecePalette: "readable",
		fog: false,
		pieceScale: 0.9
	}),
	topdown: preset("topdown", "Top-down 3D", {
		camera: "topDown3d",
		cameraMotion: "static",
		cameraIntensity: "calm",
		environment: "clarity",
		piecePalette: "readable",
		fog: false,
		pieceScale: 0.9
	}),
	cinema: preset("cinema", "Cinema", {
		camera: "auto",
		cameraMotion: "director",
		cameraIntensity: "dramatic",
		environment: "stage",
		piecePalette: "warm",
		fog: true,
		pieceScale: 0.88
	}),
	manual: preset("manual", "Manual", {
		camera: "manual",
		cameraMotion: "static",
		environment: "soft",
		piecePalette: "readable",
		fog: false
	})
});

/**
 * Returns one quick recipe, falling back to the readability-first default.
 *
 * @param {string} id Requested quick-preset identifier.
 * @returns {{id:string,name:string,options:object}} Immutable preset descriptor.
 */
export function proceduralQuickPreset(id) {
	return PROCEDURAL_QUICK_PRESETS[id] || PROCEDURAL_QUICK_PRESETS.readable;
}

function preset(id, name, options) {
	return Object.freeze({
		id,
		name,
		options: Object.freeze(options)
	});
}
