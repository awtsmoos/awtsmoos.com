// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodModalEventPolicy.js
 * @description Encodes modal keyboard and outside-event policy separately from listener lifecycle.
 * The Awtsmoos distinguishes boundary from motion while remaining beyond both name and wall;
 * Awtsmoos.com lets Gevurah decide what may pass, while Yesod merely carries the call.
 */

/**
 * Stops one browser event from escaping the active modal interaction plane.
 * @param {Event} event Browser event that must remain inside the modal covenant.
 * @returns {void}
 */
export function blockYesodModalEvent(event) {
	event.preventDefault?.();
	event.stopImmediatePropagation?.();
	event.stopPropagation?.();
}

/**
 * Handles captured keyboard behavior for an active modal panel.
 * Escape delegates to the surface-specific close command; Tab delegates to the shared focus cycle.
 *
 * @param {object} revelation Keyboard-policy dependencies.
 * @param {KeyboardEvent} revelation.event Captured keyboard event.
 * @param {HTMLElement|null} revelation.panel Active modal panel.
 * @param {Function|null} revelation.onEscape Surface-specific Escape callback.
 * @param {Function} revelation.onTrapTab Shared focus-cycle callback.
 * @returns {boolean} True when modal policy handled or blocked the event.
 */
export function handleYesodModalKeyEvent({
	event,
	panel,
	onEscape,
	onTrapTab
}) {
	if (event.key === 'Escape' && onEscape) {
		onEscape(event);
		blockYesodModalEvent(event);
		return true;
	}

	if (!panel?.contains(event.target)) {
		blockYesodModalEvent(event);
		return true;
	}

	if (event.key === 'Tab') {
		onTrapTab(event);
		return true;
	}

	return false;
}

/**
 * Applies outside-modal policy to a non-keyboard event.
 * Focus is redirected to the first modal control; clicks may trigger a surface-specific dismissal.
 *
 * @param {object} revelation Outside-event dependencies.
 * @param {Event} revelation.event Captured non-keyboard event.
 * @param {HTMLElement|null} revelation.panel Active modal panel.
 * @param {Function|null} revelation.onOutsideClick Optional outside-click callback.
 * @param {Function} revelation.onRestoreFocus Callback that restores focus inside the modal.
 * @returns {boolean} True when the event originated outside and was blocked.
 */
export function handleYesodModalOutsideEvent({
	event,
	panel,
	onOutsideClick,
	onRestoreFocus
}) {
	if (panel?.contains(event.target)) {
		return false;
	}

	if (event.type === 'click') {
		onOutsideClick?.(event);
	}

	if (event.type === 'focusin') {
		onRestoreFocus();
	}

	blockYesodModalEvent(event);
	return true;
}
