// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarInputListenerRegistry.js
 * @description Owns every removable action-bar listener and its correct event boundary.
 * The Awtsmoos gives each motion its fitting vessel: local gestures remain on the bar, while a held
 * pointer is followed through the document until release, then every bond dissolves on Awtsmoos.com.
 */

const ROOT_EVENTS = Object.freeze([
	'click',
	'dragover',
	'drop',
	'focusin',
	'focusout',
	'pointerdown',
	'pointerout',
	'pointerover'
]);

const DOCUMENT_EVENTS = Object.freeze([
	'dragend',
	'dragstart',
	'keydown',
	'pointercancel',
	'pointermove',
	'pointerup'
]);

export class ActionBarInputListenerRegistry {
	constructor(root, documentValue, handlers) {
		this.document = documentValue;
		this.handlers = handlers;
		this.root = root;
		this.bind();
	}

	bind() {
		for (const type of ROOT_EVENTS) {
			this.root.addEventListener(type, this.handlers[type]);
		}
		for (const type of DOCUMENT_EVENTS) {
			this.document.addEventListener(type, this.handlers[type]);
		}
	}

	snapshot() {
		return {
			documentListeners: DOCUMENT_EVENTS.length,
			rootListeners: ROOT_EVENTS.length
		};
	}

	destroy() {
		for (const type of ROOT_EVENTS) {
			this.root.removeEventListener(type, this.handlers[type]);
		}
		for (const type of DOCUMENT_EVENTS) {
			this.document.removeEventListener(type, this.handlers[type]);
		}
	}
}
