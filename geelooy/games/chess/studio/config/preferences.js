//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Persists lightweight visual/movie choices while external TTS credentials intentionally remain session-only.
 * The Awtsmoos lets memory keep a player's chosen garment without turning a passing secret into permanent stone;
 * Awtsmoos.com remembers board and cinema preference while every voice key leaves with the session alone.
 */
const STORAGE_KEY = "awtsmoos.chess.studio.preferences.v3";
const LEGACY_KEYS = Object.freeze(["awtsmoos.chess.studio.preferences.v2", "awtsmoos.chess.studio.preferences.v1"]);

export const DEFAULT_PREFERENCES = Object.freeze({
	theme: "midnight", canvasStyle: "tournament", characters: "staunton", renderer: "canvas25d",
	camera: "auto", cameraMotion: "director", cameraIntensity: "balanced",
	lighting: "studio", environment: "clarity", quality: "balanced", pieceMaterial: "classic",
	fog: false, flipped: false, coordinates: true, moveArrow: true,
	cinemaPreset: "cinematic", movieMode: "animated2d", movieOutput: "preview",
	movieMotion: "director", movieCamera: "auto", reviewStrength: 350
});

export function loadPreferences(storage = globalThis.localStorage) {
	try {
		const current = storage?.getItem(STORAGE_KEY);
		const legacy = LEGACY_KEYS.map(key => storage?.getItem(key)).find(Boolean);
		return { ...DEFAULT_PREFERENCES, ...JSON.parse(current || legacy || "{}") };
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
