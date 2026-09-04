//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Maps thumb-sized outcomes onto renderer, motion, 2D garment, and native-director preferences.
 * The Awtsmoos renews one lawful board before flatness, motion, character, broadcast height, or cinematic depth divide the scene;
 * Awtsmoos.com lets a player choose the visible result first and always shows which garment is presently seen.
 */
export const VIEW_QUICK_PRESETS = Object.freeze({
	instant2d: preset("instant2d", "Instant 2D", {
		renderer: "canvas2d",
		canvasStyle: "tournament",
		canvasPieceStyle: "crisp",
		characters: "staunton",
		previewMotion: "instant"
	}),
	animated2d: preset("animated2d", "Animated 2D", {
		renderer: "canvas2d",
		canvasStyle: "tournament",
		canvasPieceStyle: "crisp",
		characters: "staunton",
		previewMotion: "animated"
	}),
	crisp2d: preset("crisp2d", "Crisp 2D", {
		renderer: "canvas2d",
		canvasStyle: "contrast",
		canvasPieceStyle: "bold",
		characters: "staunton",
		previewMotion: "animated"
	}),
	royal2d: preset("royal2d", "Royal 2D", {
		renderer: "canvas2d",
		canvasStyle: "parchment",
		canvasPieceStyle: "soft",
		characters: "royal",
		previewMotion: "animated"
	}),
	framed2d: preset("framed2d", "Framed 2.5D", {
		renderer: "canvas25d",
		canvasStyle: "soft",
		canvasPieceStyle: "soft",
		previewMotion: "animated"
	}),
	topdown3d: preset("topdown3d", "Top-down 3D", native("topDown3d", "static", "calm")),
	readable3d: preset("readable3d", "Readable 3D", native("auto", "director", "calm")),
	broadcast3d: preset("broadcast3d", "Broadcast 3D", native("broadcastWhite", "static", "calm")),
	cinema3d: preset("cinema3d", "Cinema 3D", native("auto", "director", "balanced"))
});

export function applyViewQuickPreset(preferences, id) {
	const selected = VIEW_QUICK_PRESETS[id] || VIEW_QUICK_PRESETS.animated2d;
	Object.assign(preferences, selected.options);
	return selected;
}

export function activeViewQuickPreset(preferences = {}) {
	for (const presetValue of Object.values(VIEW_QUICK_PRESETS)) {
		const active = Object.entries(presetValue.options).every(([key, value]) => preferences[key] === value);
		if (active) {
			return presetValue.id;
		}
	}
	return "";
}

function native(camera, cameraMotion, cameraIntensity) {
	return Object.freeze({
		renderer: "procedural3d",
		previewMotion: "animated",
		camera,
		cameraMotion,
		cameraIntensity,
		environment: "clarity",
		piecePalette: "readable",
		fog: false
	});
}

function preset(id, name, options) {
	return Object.freeze({
		id,
		name,
		options: Object.freeze(options)
	});
}
