// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionText.js
 * @description Records every multilingual title and caption with exact timing, direction, style, and optional secondary text.
 * The Awtsmoos creates word, accompanying word, moment, and reading direction together; Awtsmoos.com preserves each finite vessel,
 * so Hebrew RTL and English LTR can be recreated from one post without returning to hidden compiler state or editor memory.
 */

export function createMovieReproductionText(project = {}) {
	const fps = positive(project.fps, 30);
	const tracks = (project.tracks || []).filter(track => ['caption', 'title'].includes(track.type));
	const clips = tracks.flatMap(track => (track.clips || []).map((clip, index) => textRecord(track, clip, index, fps)));
	return Object.freeze({ clips: Object.freeze(clips), fps, version: 3 });
}

function textRecord(track, clip, index, fps) {
	const start = nonnegative(clip.start);
	const duration = nonnegative(clip.duration);
	return Object.freeze({
		direction: clip.direction || 'ltr',
		duration,
		frameEndExclusive: Math.round((start + duration) * fps),
		frameStart: Math.round(start * fps),
		id: String(clip.id || `text-${index + 1}`),
		language: clip.language || 'en',
		position: clip.position || null,
		secondaryCaption: secondaryRecord(clip.secondaryCaption),
		speaker: clip.speaker || null,
		start,
		style: clip.style || {},
		subtitle: clip.subtitle || null,
		text: String(clip.text || ''),
		trackId: track.id || null,
		type: track.type,
		variant: clip.variant || null
	});
}

function secondaryRecord(value) {
	if (!value?.text) return null;
	return Object.freeze({
		direction: value.direction || 'ltr',
		language: value.language || 'en',
		style: value.style || {},
		text: String(value.text)
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
