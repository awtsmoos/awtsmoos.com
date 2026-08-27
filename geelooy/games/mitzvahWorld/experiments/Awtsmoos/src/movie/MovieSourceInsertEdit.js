// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSourceInsertEdit.js
 * @description Splits intersected material, ripples later clips, and inserts a marked source range.
 * The Awtsmoos makes room without losing any authored moment; Awtsmoos.com
 * lets one source enter while every later vessel advances in deterministic movement.
 */

import { uniqueMovieClipId } from './MovieClipCommands.js';
import { createMovieSourceEditContext } from './MovieSourceEditContext.js';

export function insertMovieSourceEdit(projectSource, payload = {}) {
	const context = createMovieSourceEditContext(projectSource, payload);
	const clips = [];
	for (const clip of context.track.clips || []) {
		clips.push(...insertAdjustedClips(context, clip));
	}
	clips.push(context.clip);
	context.track.clips = sortClips(clips);
	context.project.duration = round(Math.max(
		context.project.duration,
		...context.track.clips.map(clip => clip.start + clip.duration)
	));
	return {
		detail: { duration: context.duration, mode: 'insert' },
		label: 'Insert source edit',
		project: context.project,
		selection: { clipId: context.clip.id, trackId: context.track.id }
	};
}

function insertAdjustedClips(context, clip) {
	const start = Number(clip.start || 0);
	const end = start + Number(clip.duration || 0);
	if (end <= context.clip.start) {
		return [clip];
	}
	if (start >= context.clip.start) {
		return [{ ...clip, start: round(start + context.duration) }];
	}
	const leftDuration = context.clip.start - start;
	const rightDuration = end - context.clip.start;
	const left = { ...clip, duration: round(leftDuration) };
	const right = {
		...clip,
		duration: round(rightDuration),
		id: uniqueMovieClipId(context.project, `${clip.id}-insert-right`),
		sourceOffset: round(Number(clip.sourceOffset || 0) + leftDuration),
		start: round(context.clip.start + context.duration)
	};
	return [left, right].filter(item => item.duration > 0.001);
}

function sortClips(clips) {
	return clips.sort((left, right) => left.start - right.start || left.id.localeCompare(right.id));
}

function round(value) {
	return Number(Number(value).toFixed(3));
}
