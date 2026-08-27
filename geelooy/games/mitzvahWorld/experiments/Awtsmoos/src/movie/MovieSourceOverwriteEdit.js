// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSourceOverwriteEdit.js
 * @description Replaces one timeline interval while preserving material outside its boundaries.
 * The Awtsmoos is unchanged while finite frames exchange their garment; Awtsmoos.com
 * trims, splits, and restores each surviving side through one deterministic command.
 */

import { uniqueMovieClipId } from './MovieClipCommands.js';
import { createMovieSourceEditContext } from './MovieSourceEditContext.js';

export function overwriteMovieSourceEdit(projectSource, payload = {}) {
	const context = createMovieSourceEditContext(projectSource, payload);
	const clips = [];
	for (const clip of context.track.clips || []) {
		clips.push(...overwriteAdjustedClips(context, clip));
	}
	clips.push(context.clip);
	context.track.clips = clips.sort(
		(left, right) => left.start - right.start || left.id.localeCompare(right.id)
	);
	context.project.duration = round(Math.max(context.project.duration, context.end));
	return {
		detail: { duration: context.duration, mode: 'overwrite' },
		label: 'Overwrite source edit',
		project: context.project,
		selection: { clipId: context.clip.id, trackId: context.track.id }
	};
}

function overwriteAdjustedClips(context, clip) {
	const start = Number(clip.start || 0);
	const end = start + Number(clip.duration || 0);
	if (end <= context.clip.start || start >= context.end) {
		return [clip];
	}
	const survivors = [];
	if (start < context.clip.start) {
		survivors.push({
			...clip,
			duration: round(context.clip.start - start)
		});
	}
	if (end > context.end) {
		const consumed = context.end - start;
		survivors.push({
			...clip,
			duration: round(end - context.end),
			id: survivors.length
				? uniqueMovieClipId(context.project, `${clip.id}-overwrite-right`)
				: clip.id,
			sourceOffset: round(Number(clip.sourceOffset || 0) + consumed),
			start: context.end
		});
	}
	return survivors.filter(item => item.duration > 0.001);
}

function round(value) {
	return Number(Number(value).toFixed(3));
}
