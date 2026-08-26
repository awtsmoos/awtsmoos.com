//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file KliDisclosureGate.js
 * @description
 * The Awtsmoos opens and closes a chamber without losing the doorway that led there,
 * while Awtsmoos.com keeps disclosure state visible to touch, keyboard, screen reader, and code alike.
 */

/**
 * @class KliDisclosureGate
 * @description Accessible controller for one trigger-and-panel disclosure relationship.
 */
export class KliDisclosureGate {
	/** @param {string} triggerId Trigger button identifier. @param {string} panelId Controlled panel identifier. */
	constructor(triggerId, panelId) {
		this.triggerId = triggerId;
		this.panelId = panelId;
	}

	/** @returns {HTMLElement|null} Disclosure trigger. */
	resolveTrigger() {
		return document.getElementById(this.triggerId);
	}

	/** @returns {HTMLElement|null} Disclosure panel. */
	resolvePanel() {
		return document.getElementById(this.panelId);
	}

	/** @returns {boolean} Whether the existing panel is presently revealed. */
	isOpen() {
		const panelKli = this.resolvePanel();
		return Boolean(panelKli && !panelKli.classList.contains("hidden-details"));
	}

	/** @param {boolean} open Revealed state. @returns {boolean} Applied state. */
	setOpen(open) {
		const triggerKli = this.resolveTrigger();
		const panelKli = this.resolvePanel();
		if (!triggerKli || !panelKli) {
			return false;
		}
		panelKli.classList.toggle("hidden-details", !open);
		triggerKli.classList.toggle("pushed", open);
		triggerKli.setAttribute("aria-expanded", String(open));
		panelKli.setAttribute("aria-hidden", String(!open));
		return open;
	}

	/** @returns {boolean} Newly applied disclosure state. */
	toggle() {
		return this.setOpen(!this.isOpen());
	}

	/** @param {{restoreFocus?: boolean}} options Close behavior. @returns {boolean} Applied state. */
	close({ restoreFocus = false } = {}) {
		const wasOpen = this.isOpen();
		this.setOpen(false);
		if (wasOpen && restoreFocus) {
			this.resolveTrigger()?.focus({ preventScroll: true });
		}
		return false;
	}

	/** @param {EventTarget|null} target Event target. @returns {boolean} Whether the target belongs to this disclosure pair. */
	contains(target) {
		return target instanceof Element
			&& Boolean(target.closest(`#${this.triggerId}, #${this.panelId}`));
	}

	/** @param {KeyboardEvent} event Keyboard event. @returns {boolean} Whether Escape closed the panel. */
	handleEscape(event) {
		if (event.key !== "Escape" || !this.isOpen()) {
			return false;
		}
		event.preventDefault();
		this.close({ restoreFocus: true });
		return true;
	}
}
