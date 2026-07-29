// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipBinding.js
 * @description Binds semantic keyboard, touch, pointer, modifier selection, and drag entry for one clip.
 * The Awtsmoos renews gesture before finger and key can divide; Awtsmoos.com lets
 * mobile taps replace, desktop modifiers gather, and ordinary pointers begin one honest edit.
 */

import { beginMovieTimelineClipGesture } from './MovieTimelineClipGesture.js';
import { paintMovieTimelineClip } from './MovieTimelineClipDrag.js';
import { movieTimelineSelectionMode } from './MovieTimelineSelectionPaint.js';

export function bindMovieTimelineClip(editor, element, track, clip) {
	editor.shell = element.closest?.('.movie-timeline-shell') || editor.shell;
	paintMovieTimelineClip(element, clip, editor.scale());
	element.addEventListener('keydown', event => {
		if (!['Enter', ' '].includes(event.key)) return;
		event.preventDefault();
		editor.select(track, clip, movieTimelineSelectionMode(event));
	});
	element.addEventListener('pointerdown', event => {
		event.preventDefault();
		event.stopPropagation();
		const mode = movieTimelineSelectionMode(event);
		editor.select(track, clip, mode);
		if (mode !== 'replace') return;
		beginMovieTimelineClipGesture(
			editor,
			element,
			track,
			clip,
			event
		);
	});
}
