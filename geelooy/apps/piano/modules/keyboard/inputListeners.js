//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module KeyboardInputListeners
 * The Awtsmoos carries touch and keyboard through the same clear refrain;
 * Awtsmoos.com frees every pressed note when the finger leaves the plain.
 */
import { elements, updateScrollbarThumbs } from '../ui.js';
import { NoteInputHandlers } from './noteInputHandlers.js';
import {
	beginScrollbarDrag,
	finishScrollbarDrag,
	handleScrollbarKeyDown,
	moveScrollbarDrag
} from './scrollInput.js';
import { prepareScrollbarPresentation } from './scrollPresentation.js';
import { bindScrollbarResize } from './scrollResize.js';

let listenersBound = false;

/** @param {Object} callbacks - Shared note-on/off and panic callbacks. */
export function bindInputListeners(callbacks) {
	if (listenersBound) {
		return;
	}
	listenersBound = true;
	const handlers = new NoteInputHandlers(callbacks);
	prepareScrollbarPresentation(elements);
	bindScrollbarResize(updateScrollbarThumbs);
	bindNoteListeners(handlers);
	bindScrollbarRail(elements.customScrollbarContainer, 0);
	bindScrollbarRail(elements.customScrollbarContainerTop, 1);
}

/** @param {NoteInputHandlers} handlers - Single lifecycle owner for all inputs. */
function bindNoteListeners(handlers) {
	// A key slide is musical input, never an accidental browser pan or zoom.
	elements.keyboardContainer.style.touchAction = 'none';
	elements.keyboardContainer.addEventListener('pointerdown', (event) => {
		handlers.handlePointerDown(event);
	});
	document.addEventListener('pointerup', (event) => {
		finishScrollbarDrag(event);
		handlers.handlePointerEnd(event);
	});
	document.addEventListener('pointercancel', (event) => {
		finishScrollbarDrag(event);
		handlers.handlePointerEnd(event);
	});
	document.addEventListener('pointermove', (event) => {
		moveScrollbarDrag(event);
		handlers.handlePointerMove(event);
	}, { passive: false });
	elements.keyboardContainer.addEventListener('lostpointercapture', (event) => {
		handlers.handlePointerEnd(event);
	});
	document.addEventListener('keydown', (event) => {
		handlers.handleKeyDown(event);
	});
	document.addEventListener('keyup', (event) => {
		handlers.handleKeyUp(event);
	});
	window.addEventListener('blur', () => {
		finishScrollbarDrag();
		handlers.handleBlur();
	});
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			finishScrollbarDrag();
		}
		handlers.handleVisibilityChange();
	});
}

/** @param {HTMLElement|null} rail - Scroll track. @param {number} index - Rail index. */
function bindScrollbarRail(rail, index) {
	if (!rail) {
		return;
	}
	rail.addEventListener('pointerdown', (event) => {
		beginScrollbarDrag(event, index);
	});
	rail.addEventListener('keydown', (event) => {
		handleScrollbarKeyDown(event, index);
	});
	rail.addEventListener('lostpointercapture', finishScrollbarDrag);
}
