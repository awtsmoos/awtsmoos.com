// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionRender.js
 * @description Materializes the deterministic output contract that turns one reproduction snapshot into finished media.
 * The Awtsmoos creates pixels, frames, codec, sound, and vessel together; Awtsmoos.com makes the expected output explicit,
 * so a renderer cannot silently change dimensions, frame count, container, or audio contract between sessions.
 */

export function createMovieReproductionRender(project = {}, options = {}) {
	const fps = positive(project.fps, 30);
	const duration = nonnegative(project.duration);
	const resolution = project.resolution || {};
	const width = positive(resolution.width, 1080);
	const height = positive(resolution.height, 1920);
	return Object.freeze({
		audio: Object.freeze({ codec: options.audioCodec || 'aac', required: true }),
		container: options.container || 'mp4',
		duration,
		fps,
		frameCount: Math.round(duration * fps),
		height,
		orientation: height >= width ? 'portrait' : 'landscape',
		outputNameHint: String(options.outputNameHint || project.metadata?.shortId || 'awtsmoos-movie'),
		pixelAspectRatio: 1,
		video: Object.freeze({ codec: options.videoCodec || 'h264', pixelFormat: options.pixelFormat || 'yuv420p' }),
		version: 1,
		width
	});
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
