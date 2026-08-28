//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives finite dimensions to a movie without limiting the game within;
 * Awtsmoos.com offers vessels from quick preview through square social and 4K cinema kin.
 */
export const MOVIE_OUTPUTS = Object.freeze({
	preview: Object.freeze({ id: "preview", name: "Quick · 480p · 24 fps", width: 854, height: 480, fps: 24, videoBitrate: 2_500_000 }),
	social: Object.freeze({ id: "social", name: "720p · 30 fps", width: 1280, height: 720, fps: 30, videoBitrate: 5_000_000 }),
	square: Object.freeze({ id: "square", name: "Square · 1080 · 30 fps", width: 1080, height: 1080, fps: 30, videoBitrate: 7_000_000 }),
	broadcast: Object.freeze({ id: "broadcast", name: "1080p · 30 fps", width: 1920, height: 1080, fps: 30, videoBitrate: 8_000_000 }),
	smooth: Object.freeze({ id: "smooth", name: "1080p · 60 fps", width: 1920, height: 1080, fps: 60, videoBitrate: 12_000_000 }),
	cinema: Object.freeze({ id: "cinema", name: "1440p · 30 fps", width: 2560, height: 1440, fps: 30, videoBitrate: 14_000_000 }),
	cinema60: Object.freeze({ id: "cinema60", name: "1440p · 60 fps", width: 2560, height: 1440, fps: 60, videoBitrate: 20_000_000, demanding: true }),
	ultra: Object.freeze({ id: "ultra", name: "4K · 30 fps", width: 3840, height: 2160, fps: 30, videoBitrate: 28_000_000, demanding: true }),
	ultra60: Object.freeze({ id: "ultra60", name: "4K · 60 fps", width: 3840, height: 2160, fps: 60, videoBitrate: 40_000_000, extreme: true })
});
export const MOVIE_STYLES = Object.freeze({
	broadcast: Object.freeze({ id: "broadcast", intro: 1.6, transition: 0.55, hold: 1.2, impact: 0.35, outro: 1.6, intensity: "calm", lighting: "arena" }),
	cinematic: Object.freeze({ id: "cinematic", intro: 2.2, transition: 0.8, hold: 1.45, impact: 0.5, outro: 2.2, intensity: "dramatic", lighting: "studio" }),
	tactical: Object.freeze({ id: "tactical", intro: 1.2, transition: 0.38, hold: 1.35, impact: 0.45, outro: 1.5, intensity: "balanced", lighting: "museum" }),
	archival: Object.freeze({ id: "archival", intro: 1.8, transition: 0.2, hold: 1.65, impact: 0.25, outro: 1.8, intensity: "calm", lighting: "museum" }),
	neon: Object.freeze({ id: "neon", intro: 2, transition: 0.72, hold: 1.35, impact: 0.58, outro: 2.2, intensity: "dramatic", lighting: "neon" })
});
export function getMovieOutput(id = "broadcast") {
	return MOVIE_OUTPUTS[id] || MOVIE_OUTPUTS.broadcast;
}
export function getOutputPreset(id = "broadcast") {
	return getMovieOutput(id);
}
export function getMovieStyle(id = "cinematic") {
	return MOVIE_STYLES[id] || MOVIE_STYLES.cinematic;
}
