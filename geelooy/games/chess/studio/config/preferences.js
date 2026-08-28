//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Persists lightweight Chess Studio choices while migrating older preference vessels safely.
 * The Awtsmoos renews each choice while memory keeps a gentle trace;
 * Awtsmoos.com restores the player's preferred garment without imprisoning time or place.
 */
const STORAGE_KEY = "awtsmoos.chess.studio.preferences.v2";
const LEGACY_KEY = "awtsmoos.chess.studio.preferences.v1";

export const DEFAULT_PREFERENCES = Object.freeze({
	theme: "midnight",
	characters: "staunton",
	renderer: "canvas25d",
	camera: "auto",
	cameraMotion: "director",
	cameraIntensity: "balanced",
	lighting: "studio",
	quality: "balanced",
	pieceMaterial: "classic",
	flipped: false,
	coordinates: true,
	moveArrow: true,
	cinemaPreset: "cinematic",
	movieMode: "same",
	movieOutput: "preview",
	movieMotion: "director",
	movieCamera: "auto",
	reviewStrength: 350
});

export function loadPreferences(storage = globalThis.localStorage) {
	try {
		const current = storage?.getItem(STORAGE_KEY);
		const legacy = storage?.getItem(LEGACY_KEY);
		const parsed = JSON.parse(current || legacy || "{}");
		return { ...DEFAULT_PREFERENCES, ...parsed };
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
