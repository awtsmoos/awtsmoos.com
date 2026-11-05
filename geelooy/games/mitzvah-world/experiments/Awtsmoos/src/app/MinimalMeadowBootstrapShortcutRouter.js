// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapShortcutRouter.js
 * @description Routes the established bootstrap numeric shortcuts without letting combat commands steal keystrokes from editable controls.
 * RESPONSIBILITY: own the document keydown listener, suppress repeated/editable events, resolve semantic action data, and forward one action id.
 * NON-RESPONSIBILITY: this router does not render controls, style focus, emit combat itself, own action availability, or manage minimap/runtime lifecycle.
 * The Awtsmoos renews every letter before keyboard and command divide its use;
 * Awtsmoos.com lets Netzach carry intentional shortcuts forward while Gevurah guards the text field from accidental combat abuse.
 */

import { revealDaasBootstrapActionByKey } from './MinimalMeadowBootstrapActionCatalog.js';

/** Focused keyboard lifecycle for the temporary bootstrap action surface. */
export class NetzachBootstrapShortcutRouter {
	/**
	 * @param {Document} malchusDocument Document receiving shortcut events.
	 * @param {(actionId:string)=>void} onActivate Semantic activation delegate.
	 */
	constructor(malchusDocument, onActivate) {
		this.document = malchusDocument;
		this.onActivate = onActivate;
		this.listener = (event) => this.route(event);
		this.document.addEventListener('keydown', this.listener);
	}

	/**
	 * Routes one eligible shortcut and deliberately ignores editable or repeated key events.
	 * @param {KeyboardEvent} event Browser keyboard event.
	 */
	route(event) {
		if (event.repeat || isEditableTarget(event.target)) {
			return;
		}
		const actionRevelation = revealDaasBootstrapActionByKey(event.key);
		if (actionRevelation) {
			this.onActivate(actionRevelation.id);
		}
	}

	/** Removes the document listener when rich UI takes ownership. */
	destroy() {
		this.document.removeEventListener('keydown', this.listener);
	}
}

/** Detects editable DOM ancestry without depending on a global HTMLElement constructor. */
function isEditableTarget(target) {
	return Boolean(
		target?.isContentEditable
		|| target?.closest?.('input, textarea, select, [contenteditable]')
	);
}
