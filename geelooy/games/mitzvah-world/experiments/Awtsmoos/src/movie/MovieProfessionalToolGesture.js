// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProfessionalToolGesture.js
 * @description Converts professional trim-tool drags into one immutable command committed on pointer release.
 * The Awtsmoos is beyond gesture and result while every finite drag deserves one measured intention;
 * Awtsmoos.com previews seconds without mutating project truth and commits one undoable operation at completion.
 */

import { captureMoviePointer } from './MoviePointerCapture.js';

const COMMANDS = Object.freeze({
	rateStretch: 'rateStretchClip',
	ripple: 'rippleTrimClip',
	roll: 'rollClip',
	slide: 'slideClip',
	slip: 'slipClip'
});

export function isMovieProfessionalTool(value) {
	return Object.hasOwn(COMMANDS, String(value || ''));
}

export function beginMovieProfessionalToolGesture(
	editor,
	element,
	track,
	clip,
	event
) {
	const tool = editor.tool();
	if (!isMovieProfessionalTool(tool)) return false;
	editor.professional = {
		clip,
		delta: 0,
		edge: event.target?.dataset?.trim || 'end',
		element,
		originX: event.clientX,
		track,
		tool
	};
	element.classList.add('is-tool-dragging');
	captureMoviePointer(element, event.pointerId);
	addEventListener('pointermove', editor.moveHandler);
	addEventListener('pointerup', editor.upHandler, { once: true });
	return true;
}

export function updateMovieProfessionalToolGesture(editor, event) {
	const gesture = editor.professional;
	if (!gesture) return false;
	gesture.delta = round((event.clientX - gesture.originX) / editor.scale());
	gesture.element.dataset.toolDelta = `${gesture.delta.toFixed(3)}s`;
	return true;
}

export function finishMovieProfessionalToolGesture(editor) {
	const gesture = editor.professional;
	if (!gesture) return false;
	const command = COMMANDS[gesture.tool];
	const payload = commandPayload(gesture);
	releaseMovieProfessionalToolGesture(editor);
	editor.runCommand?.(command, payload);
	return true;
}

export function releaseMovieProfessionalToolGesture(editor) {
	editor.professional?.element?.classList.remove('is-tool-dragging');
	if (editor.professional?.element?.dataset) {
		delete editor.professional.element.dataset.toolDelta;
	}
	editor.professional = null;
	removeEventListener('pointermove', editor.moveHandler);
	removeEventListener('pointerup', editor.upHandler);
}

function commandPayload(gesture) {
	if (gesture.tool === 'ripple') {
		return { delta: gesture.delta, edge: gesture.edge };
	}
	if (gesture.tool === 'rateStretch') {
		return {
			duration: Math.max(0.001, gesture.clip.duration + gesture.delta)
		};
	}
	return { delta: gesture.delta };
}

function round(value) {
	return Number(Number(value).toFixed(4));
}
