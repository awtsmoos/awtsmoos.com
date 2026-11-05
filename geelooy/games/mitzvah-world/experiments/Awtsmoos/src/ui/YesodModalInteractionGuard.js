// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodModalInteractionGuard.js
 * @description Owns modal capture-listener lifecycle while event policy and focus cycling live in dedicated vessels.
 * The Awtsmoos lets every boundary reveal one simple function without losing the infinite whole;
 * Awtsmoos.com keeps Yesod readable by sending focus to Tiferes and event judgment to Gevurah's role.
 */

import {
	handleYesodModalKeyEvent,
	handleYesodModalOutsideEvent
} from './YesodModalEventPolicy.js';
import { YesodModalFocusCycle } from './YesodModalFocusCycle.js';

const YESOD_CAPTURED_EVENTS = Object.freeze([
	'pointerdown',
	'pointerup',
	'click',
	'dblclick',
	'touchstart',
	'touchend',
	'wheel',
	'contextmenu',
	'focusin',
	'keydown'
]);

export class YesodModalInteractionGuard {
	/**
	 * @param {Document} malchusDocument Owning document.
	 * @param {HTMLElement} yesodPanel Active dialog panel.
	 * @param {object} [revelation={}] Modal interaction policy.
	 * @param {string} [revelation.firstFocusSelector] Preferred initial-focus selector.
	 * @param {Function} [revelation.onEscape] Escape callback.
	 * @param {Function} [revelation.onOutsideClick] Outside-click callback.
	 */
	constructor(malchusDocument, yesodPanel, revelation = {}) {
		this.document = malchusDocument;
		this.panel = yesodPanel;
		this.onEscape = revelation.onEscape || null;
		this.onOutsideClick = revelation.onOutsideClick || null;
		this.active = false;
		this.focusCycle = new YesodModalFocusCycle(
			malchusDocument,
			yesodPanel,
			revelation.firstFocusSelector || '[autofocus],button'
		);
		this.boundEvent = event => this.handleEvent(event);
	}

	/** Activates capture listeners exactly once. @returns {boolean} Whether state changed. */
	activate() {
		if (this.active) {
			return false;
		}

		for (const eventName of YESOD_CAPTURED_EVENTS) {
			this.document.addEventListener(eventName, this.boundEvent, true);
		}
		this.active = true;
		return true;
	}

	/** Removes capture listeners exactly once. @returns {boolean} Whether state changed. */
	deactivate() {
		if (!this.active) {
			return false;
		}

		for (const eventName of YESOD_CAPTURED_EVENTS) {
			this.document.removeEventListener(eventName, this.boundEvent, true);
		}
		this.active = false;
		return true;
	}

	/** Rebinds modal and focus ownership after a dialog rerender. @param {HTMLElement} yesodPanel New panel. @returns {void} */
	setPanel(yesodPanel) {
		this.panel = yesodPanel;
		this.focusCycle.setPanel(yesodPanel);
	}

	/** Focuses the configured first control. @returns {boolean} Whether focus was requested. */
	focusFirst() {
		return this.focusCycle.focusFirst();
	}

	/** Preserves the historical focus-trap API. @param {KeyboardEvent} event Tab event. @returns {boolean} Whether focus moved. */
	trapTab(event) {
		return this.focusCycle.trap(event);
	}

	/** Routes one captured event into keyboard or outside-event policy. @param {Event} event Captured browser event. @returns {boolean} Whether modal policy handled it. */
	handleEvent(event) {
		if (event.type === 'keydown') {
			return this.handleKeyDown(event);
		}

		return handleYesodModalOutsideEvent({
			event,
			panel: this.panel,
			onOutsideClick: this.onOutsideClick,
			onRestoreFocus: () => this.focusFirst()
		});
	}

	/** Preserves the historical keyboard-policy API while delegating its mechanics. @param {KeyboardEvent} event Captured key event. @returns {boolean} Whether policy handled it. */
	handleKeyDown(event) {
		return handleYesodModalKeyEvent({
			event,
			panel: this.panel,
			onEscape: this.onEscape,
			onTrapTab: keyEvent => this.trapTab(keyEvent)
		});
	}
}
