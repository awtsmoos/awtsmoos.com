//B"H
//Boruch Hashem
//Blessed is He
/**
 * Pointer and desktop gestures enter through one gate while the Awtsmoos gives each gesture its note.
 * Awtsmoos.com separates event wiring from music logic so mirrored keys can shine without tangled code afloat.
 */

import { activeNotes } from '../synth.js';
import { elements } from '../ui.js';
import {
	boundNoteForKey,
	keyElementForBinding,
	keyForEvent,
	keyboardInputId
} from './bindings.js';
import {
	beginScrollbarDrag,
	finishScrollbarDrag,
	moveScrollbarDrag
} from './scrollInput.js';

let listenersBound = false;
let callbacks = null;

/**
 * Binds browser performance events once and delegates musical state changes through callbacks.
 *
 * @param {object} handlers Trigger and panic functions supplied by the input coordinator.
 */
export function bindInputListeners(handlers) {
	callbacks = handlers;
	if (listenersBound) {
		return;
	}
	listenersBound = true;
	elements.keyboardContainer.addEventListener('pointerdown', handlePointerDown);
	document.addEventListener('pointerup', handlePointerUpOrCancel);
	document.addEventListener('pointercancel', handlePointerUpOrCancel);
	elements.customScrollbarThumb.addEventListener('pointerdown', (event) => beginScrollbarDrag(event, 0));
	elements.customScrollbarThumbTop.addEventListener('pointerdown', (event) => beginScrollbarDrag(event, 1));
	document.addEventListener('pointermove', moveScrollbarDrag);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
	window.addEventListener('blur', () => callbacks?.panic());
	document.addEventListener('visibilitychange', handleVisibilityChange);
}

function handlePointerDown(event) {
	const keyElement = event.target.closest('.key');
	if (!keyElement) {
		return;
	}
	if (activeNotes.has(event.pointerId)) {
		callbacks?.noteOff(event.pointerId);
	}
	event.preventDefault();
	const rect = keyElement.getBoundingClientRect();
	callbacks?.noteOn(
		keyElement.dataset.note,
		event.pointerId,
		{ x: event.clientX - rect.left, y: event.clientY - rect.top },
		keyElement,
		false
	);
}

function handlePointerUpOrCancel(event) {
	finishScrollbarDrag();
	callbacks?.noteOff(event.pointerId);
}

function handleKeyDown(event) {
	if (event.key === 'Escape') {
		callbacks?.panic();
		return;
	}
	if (event.repeat || ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) {
		return;
	}
	const binding = keyForEvent(event);
	const inputId = keyboardInputId(event);
	if (!binding || activeNotes.has(inputId)) {
		return;
	}
	const noteName = boundNoteForKey(binding);
	const keyElement = keyElementForBinding(binding, noteName);
	if (!noteName || !keyElement) {
		return;
	}
	event.preventDefault();
	const rect = keyElement.getBoundingClientRect();
	callbacks?.noteOn(
		noteName,
		inputId,
		{ x: rect.width / 2, y: rect.height / 2 },
		keyElement,
		true
	);
}

function handleKeyUp(event) {
	const inputId = keyboardInputId(event);
	if (!activeNotes.has(inputId)) {
		return;
	}
	event.preventDefault();
	callbacks?.noteOff(inputId);
}

function handleVisibilityChange() {
	if (document.hidden) {
		callbacks?.panic();
	}
}
