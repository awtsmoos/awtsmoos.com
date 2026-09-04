//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines deterministic movie dimensions and pacing vessels, including portrait-first export without crop-after-render tricks.
 * The Awtsmoos gives finite width, height, time, and bitrate to a story whose chess truth remains whole within;
 * Awtsmoos.com lets landscape, square, and vertical frames each receive native direction instead of losing squares at the rim.
 */
export const MOVIE_OUTPUTS = Object.freeze({
	preview: output("preview", "Quick · 480p · 24 fps", 854, 480, 24, 2_500_000),
	social: output("social", "Landscape · 720p · 30 fps", 1280, 720, 30, 5_000_000),
	vertical: output("vertical", "Vertical · 1080×1920 · 30 fps", 1080, 1920, 30, 8_000_000),
	square: output("square", "Square · 1080 · 30 fps", 1080, 1080, 30, 7_000_000),
	broadcast: output("broadcast", "1080p · 30 fps", 1920, 1080, 30, 8_000_000),
	smooth: output("smooth", "1080p · 60 fps", 1920, 1080, 60, 12_000_000),
	cinema: output("cinema", "1440p · 30 fps", 2560, 1440, 30, 14_000_000),
	cinema60: output("cinema60", "1440p · 60 fps", 2560, 1440, 60, 20_000_000, { demanding: true }),
	ultra: output("ultra", "4K · 30 fps", 3840, 2160, 30, 28_000_000, { demanding: true }),
	ultra60: output("ultra60", "4K · 60 fps", 3840, 2160, 60, 40_000_000, { extreme: true })
});

export const MOVIE_STYLES = Object.freeze({
	broadcast: style("broadcast", 1.6, 0.55, 1.2, 0.35, 1.6, "calm", "arena"),
	cinematic: style("cinematic", 2.2, 0.8, 1.45, 0.5, 2.2, "dramatic", "studio"),
	tactical: style("tactical", 1.2, 0.38, 1.35, 0.45, 1.5, "balanced", "museum"),
	archival: style("archival", 1.8, 0.2, 1.65, 0.25, 1.8, "calm", "museum"),
	neon: style("neon", 2, 0.72, 1.35, 0.58, 2.2, "dramatic", "neon")
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

function output(id, name, width, height, fps, videoBitrate, extra = {}) {
	return Object.freeze({ id, name, width, height, fps, videoBitrate, ...extra });
}

function style(id, intro, transition, hold, impact, outro, intensity, lighting) {
	return Object.freeze({ id, intro, transition, hold, impact, outro, intensity, lighting });
}
