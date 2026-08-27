// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipBinding.js
 * @description Routes clip keyboard and pointer entry through navigation, blade, and professional trim tools.
 * The Awtsmoos renews gesture before finger and key can divide; Awtsmoos.com lets
 * selection, blade, ripple, roll, slip, slide, rate, and navigation pass through one truthful gate.
 */

import {
	beginMovieProfessionalToolGesture,
	isMovieProfessionalTool
} from './MovieProfessionalToolGesture.js';
import { beginMovieTimelineClipGesture } from './MovieTimelineClipGesture.js';
import { paintMovieTimelineClip } from './MovieTimelineClipDrag.js';
import { movieTimelineSelectionMode } from './MovieTimelineSelectionPaint.js';

export function bindMovieTimelineClip(editor, element, track, clip) {
	editor.shell = element.closest?.('.movie-timeline-shell') || editor.shell;
	paintMovieTimelineClip(element, clip, editor.scale());
	element.addEventListener('keydown', event => onClipKey(editor, track, clip, event));
	element.addEventListener('pointerdown', event => onClipPointer(
		editor,
		element,
		track,
		clip,
		event
	));
}

function onClipKey(editor, track, clip, event) {
	if (!['Enter', ' '].includes(event.key)) return;
	event.preventDefault();
	if (editor.tool() === 'blade') {
		editor.blade(track, clip, event);
		return;
	}
	editor.select(track, clip, movieTimelineSelectionMode(event));
}

function onClipPointer(editor, element, track, clip, event) {
	const tool = editor.tool();
	if (tool === 'hand' || tool === 'zoom') return;
	event.preventDefault();
	event.stopPropagation();
	if (tool === 'blade') {
		editor.blade(track, clip, event);
		return;
	}
	const mode = movieTimelineSelectionMode(event);
	editor.select(track, clip, mode);
	if (isMovieProfessionalTool(tool)) {
		beginMovieProfessionalToolGesture(editor, element, track, clip, event);
		return;
	}
	if (mode === 'replace') {
		beginMovieTimelineClipGesture(editor, element, track, clip, event);
	}
}
