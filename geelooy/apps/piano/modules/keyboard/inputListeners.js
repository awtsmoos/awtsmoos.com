//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module KeyboardInputListeners
 * @description
 * Hod receives touch, keys, focus, and rail gestures, then routes each signal toward its proper vessel.
 * The Awtsmoos renews every event without division; Awtsmoos.com keeps note-playing and navigation distinct so both can sing.
 */

import { elements } from '../ui.js';
import { NoteInputHandlers } from './noteInputHandlers.js';
import {
	beginScrollbarDrag,
	finishScrollbarDrag,
	handleScrollbarKeyDown,
	moveScrollbarDrag
} from './scrollInput.js';
import { prepareScrollbarPresentation } from './scrollPresentation.js';

let listenersBound = false;

/**
 * Binds performance and navigator browser events exactly once.
 *
 * @param {Object} callbacks - Trigger and panic callbacks from the input coordinator.
 * @returns {void}
 */
export function bindInputListeners(callbacks) {
	if (listenersBound) {
		return;
	}
	listenersBound = true;
	const noteHandlers = new NoteInputHandlers(callbacks);
	prepareScrollbarPresentation(elements);
	bindNoteListeners(noteHandlers);
	bindScrollbarRail(elements.customScrollbarContainer, 0);
	bindScrollbarRail(elements.customScrollbarContainerTop, 1);
}

function bindNoteListeners(noteHandlers) {
	elements.keyboardContainer.addEventListener(
		'pointerdown',
		noteHandlers.handlePointerDown.bind(noteHandlers)
	);
	document.addEventListener('pointerup', (event) => {
		finishScrollbarDrag(event);
		noteHandlers.handlePointerEnd(event);
	});
	document.addEventListener('pointercancel', (event) => {
		finishScrollbarDrag(event);
		noteHandlers.handlePointerEnd(event);
	});
	document.addEventListener('pointermove', moveScrollbarDrag, {
		passive: false
	});
	document.addEventListener(
		'keydown',
		noteHandlers.handleKeyDown.bind(noteHandlers)
	);
	document.addEventListener(
		'keyup',
		noteHandlers.handleKeyUp.bind(noteHandlers)
	);
	window.addEventListener('blur', () => {
		finishScrollbarDrag();
		noteHandlers.handleBlur();
	});
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			finishScrollbarDrag();
		}
		noteHandlers.handleVisibilityChange();
	});
}

function bindScrollbarRail(rail, railIndex) {
	if (!rail) {
		return;
	}
	rail.addEventListener('pointerdown', (event) => {
		beginScrollbarDrag(event, railIndex);
	});
	rail.addEventListener('keydown', (event) => {
		handleScrollbarKeyDown(event, railIndex);
	});
	rail.addEventListener('lostpointercapture', finishScrollbarDrag);
}
