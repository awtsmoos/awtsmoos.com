//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Maps thumb-sized outcomes onto stable 2D and intentionally distinct native 3D visual contracts.
 * The Awtsmoos renews one lawful board before readability and cinema divide its finite garment;
 * Awtsmoos.com lets calm views protect the pieces while dramatic views explicitly ask for motion.
 */
export const VIEW_QUICK_PRESETS = Object.freeze({
	instant2d: preset("instant2d", "Instant 2D", flat("tournament", "crisp", "staunton", "instant")),
	animated2d: preset("animated2d", "Animated 2D", flat("tournament", "crisp", "staunton", "animated")),
	crisp2d: preset("crisp2d", "Crisp 2D", flat("contrast", "bold", "staunton", "animated")),
	royal2d: preset("royal2d", "Royal 2D", flat("parchment", "soft", "royal", "animated")),
	framed2d: preset("framed2d", "Framed 2.5D", {
		renderer: "canvas25d",
		canvasStyle: "soft",
		canvasPieceStyle: "soft",
		previewMotion: "animated"
	}),
	topdown3d: preset("topdown3d", "Top-down 3D", readableNative("topDown3d")),
	readable3d: preset("readable3d", "Readable 3D", readableNative("birdseyeWhite")),
	broadcast3d: preset("broadcast3d", "Broadcast 3D", readableNative("broadcastWhite")),
	cinema3d: preset("cinema3d", "Cinema 3D", Object.freeze({
		renderer: "procedural3d",
		previewMotion: "animated",
		camera: "auto",
		cameraMotion: "director",
		cameraIntensity: "balanced",
		lighting: "studio",
		environment: "clarity",
		piecePalette: "readable",
		pieceScale: 0.86,
		fog: false
	}))
});

/** @param {object} preferences Mutable preferences. @param {string} id Quick id. @returns {Readonly<object>} Selected preset. */
export function applyViewQuickPreset(preferences, id) {
	const selected = VIEW_QUICK_PRESETS[id] || VIEW_QUICK_PRESETS.animated2d;
	Object.assign(preferences, selected.options);
	return selected;
}

/** @param {object} [preferences={}] Preferences. @returns {string} Matching quick preset id. */
export function activeViewQuickPreset(preferences = {}) {
	for (const value of Object.values(VIEW_QUICK_PRESETS)) {
		if (Object.entries(value.options).every(([key, option]) => preferences[key] === option)) return value.id;
	}
	return "";
}

function flat(canvasStyle, canvasPieceStyle, characters, previewMotion) {
	return Object.freeze({ renderer: "canvas2d", canvasStyle, canvasPieceStyle, characters, previewMotion });
}

function readableNative(camera) {
	return Object.freeze({
		renderer: "procedural3d",
		previewMotion: "animated",
		camera,
		cameraMotion: "static",
		cameraIntensity: "calm",
		lighting: "readability",
		environment: "readability",
		piecePalette: "readable",
		pieceScale: 0.82,
		fog: false
	});
}

function preset(id, name, options) {
	return Object.freeze({ id, name, options: Object.freeze(options) });
}
