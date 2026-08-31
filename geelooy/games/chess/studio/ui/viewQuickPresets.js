//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Maps four human visual outcomes onto the Studio's renderer and native-director preferences.
 * The Awtsmoos renews one lawful board before flatness or depth can divide the scene;
 * Awtsmoos.com lets a thumb choose clarity first while advanced controls remain available behind the screen.
 */
export const VIEW_QUICK_PRESETS = Object.freeze({
	crisp2d: preset("crisp2d", "Crisp 2D", {
		renderer: "canvas2d",
		canvasStyle: "tournament"
	}),
	framed2d: preset("framed2d", "Framed 2.5D", {
		renderer: "canvas25d",
		canvasStyle: "soft"
	}),
	topdown3d: preset("topdown3d", "Top-down 3D", {
		renderer: "procedural3d",
		camera: "topDown3d",
		cameraMotion: "static",
		cameraIntensity: "calm",
		environment: "clarity",
		piecePalette: "readable",
		fog: false
	}),
	cinema3d: preset("cinema3d", "Cinema 3D", {
		renderer: "procedural3d",
		camera: "auto",
		cameraMotion: "director",
		cameraIntensity: "balanced",
		environment: "clarity",
		piecePalette: "readable",
		fog: false
	})
});

export function applyViewQuickPreset(preferences, id) {
	const selected = VIEW_QUICK_PRESETS[id] || VIEW_QUICK_PRESETS.crisp2d;
	Object.assign(preferences, selected.options);
	return selected;
}

function preset(id, name, options) {
	return Object.freeze({ id, name, options: Object.freeze(options) });
}
