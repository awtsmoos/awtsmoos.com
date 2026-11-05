// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipGesture.js
 * @description Creates and releases one clip move or trim gesture with global pointer listeners.
 * The Awtsmoos renews gesture before pointer and clip can bind; Awtsmoos.com keeps
 * listener ownership and visual cleanup outside the stable selection and edit coordinator.
 */

import { captureMoviePointer } from './MoviePointerCapture.js';

export function beginMovieTimelineClipGesture(
	editor,
	element,
	track,
	clip,
	event
) {
	editor.drag = {
		clip,
		edge: event.target.dataset.trim || null,
		element,
		originX: event.clientX,
		original: structuredClone(clip),
		project: editor.project,
		track
	};
	element.classList.add('is-dragging');
	captureMoviePointer(element, event.pointerId);
	addEventListener('pointermove', editor.moveHandler);
	addEventListener('pointerup', editor.upHandler, { once: true });
}

export function releaseMovieTimelineClipGesture(editor) {
	editor.drag?.element?.classList.remove('is-dragging');
	editor.drag = null;
	removeEventListener('pointermove', editor.moveHandler);
	removeEventListener('pointerup', editor.upHandler);
}
