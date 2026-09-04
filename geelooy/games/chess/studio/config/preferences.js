//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Persists lightweight Studio presentation choices while narration credentials remain deliberately session-only.
 * The Awtsmoos lets memory keep board, motion, and glyph garments without making a passing secret into stone;
 * Awtsmoos.com greets new players with animated high-contrast 2D and keeps optional native depth deliberately chosen.
 */
const STORAGE_KEY = "awtsmoos.chess.studio.preferences.v6";
const LEGACY_KEYS = Object.freeze([
	"awtsmoos.chess.studio.preferences.v5", "awtsmoos.chess.studio.preferences.v4",
	"awtsmoos.chess.studio.preferences.v3", "awtsmoos.chess.studio.preferences.v2",
	"awtsmoos.chess.studio.preferences.v1"
]);

export const DEFAULT_PREFERENCES = Object.freeze({
	theme: "midnight", canvasStyle: "tournament", canvasPieceStyle: "crisp", characters: "staunton",
	renderer: "canvas2d", previewMotion: "animated", camera: "auto", cameraMotion: "director",
	cameraIntensity: "balanced", lighting: "studio", environment: "clarity", quality: "balanced",
	pieceMaterial: "classic", piecePalette: "readable", fog: false, flipped: false,
	coordinates: true, moveArrow: true, cinemaPreset: "cinematic", movieMode: "animated2d",
	movieOutput: "preview", movieMotion: "director", movieCamera: "auto", reviewStrength: 350
});

export function loadPreferences(storage = globalThis.localStorage) {
	try {
		const current = storage?.getItem(STORAGE_KEY);
		if (current) return { ...DEFAULT_PREFERENCES, ...JSON.parse(current) };
		const legacy = LEGACY_KEYS.map(key => storage?.getItem(key)).find(Boolean);
		return legacy ? migrateLegacy(JSON.parse(legacy)) : { ...DEFAULT_PREFERENCES };
	} catch {
		return { ...DEFAULT_PREFERENCES };
	}
}

export function savePreferences(preferences, storage = globalThis.localStorage) {
	try {
		storage?.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_PREFERENCES, ...preferences }));
		return true;
	} catch {
		return false;
	}
}

function migrateLegacy(legacy = {}) {
	return {
		...DEFAULT_PREFERENCES,
		...legacy,
		canvasPieceStyle: legacy.canvasPieceStyle || "crisp",
		environment: legacy.environment || "clarity",
		piecePalette: legacy.piecePalette || "readable",
		previewMotion: legacy.previewMotion || "animated",
		fog: Boolean(legacy.fog && legacy.environment === "stage")
	};
}
