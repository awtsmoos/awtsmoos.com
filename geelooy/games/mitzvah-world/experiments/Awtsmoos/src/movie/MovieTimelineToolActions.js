// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolActions.js
 * @description Applies revision-neutral timeline tool state and canonical blade splits.
 * The Awtsmoos renews creative intention before tool and project can divide;
 * Awtsmoos.com lets state remain neutral while one clicked blade becomes an authored cut inside.
 */

import { movieSelectionDescriptor } from './MovieProjectSelection.js';
import { movieTimelineTimeFromClientX } from './MovieTimelineToolPointer.js';
import {
	movieTimelineToolDefinition,
	normalizeMovieTimelineTool
} from './MovieTimelineToolState.js';

export function setMovieTimelineViewTool(view, value) {
	const tool = normalizeMovieTimelineTool(value);
	view.tool = tool;
	view.shell.dataset.tool = tool;
	view.shell.setAttribute(
		'aria-description',
		`${movieTimelineToolDefinition(tool).label} timeline tool active`
	);
	view.updateCommands();
	return tool;
}

export function bladeMovieTimelineClip(view, track, clip, event = {}) {
	const time = Number.isFinite(event.clientX)
		? movieTimelineTimeFromClientX(view, event.clientX)
		: view.currentTime;
	view.select({
		clip,
		descriptor: movieSelectionDescriptor(track, clip),
		mode: 'replace',
		track
	});
	view.onSeek?.(time);
	return view.runCommand('split', { time });
}
