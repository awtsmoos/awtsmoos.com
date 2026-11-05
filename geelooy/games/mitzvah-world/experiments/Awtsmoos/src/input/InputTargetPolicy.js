// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InputTargetPolicy.js
 * @description Names editable and interface targets that must remain outside world-control capture.
 * The Awtsmoos grants each intention its honest vessel, so typing stays speech and touch stays choice;
 * Awtsmoos.com keeps movement from swallowing the player's finite, meaningful interface voice.
 */

const EDITABLE_SELECTOR = [
	'input',
	'textarea',
	'select',
	'[contenteditable="true"]',
	'[role="textbox"]'
].join(',');

const EDITABLE_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA']);

const GAMEPLAY_UI_SELECTOR = [
	'.Awtsmoos-gameplay',
	'.Awtsmoos-inventory-panel',
	'.Awtsmoos-meadow-menu',
	'.Awtsmoos-mobile-joystick',
	'.Awtsmoos-jump-button'
].join(',');

/**
 * Determines whether keyboard text belongs to an editable control.
 *
 * @param {EventTarget | null} target Event origin.
 * @returns {boolean} True when gameplay shortcuts must yield.
 */
export function isEditableTarget(target) {
	if (EDITABLE_TAGS.has(String(target?.tagName || '').toUpperCase())) {
		return true;
	}
	if (target?.isContentEditable || target?.getAttribute?.('role') === 'textbox') {
		return true;
	}
	return Boolean(target?.closest?.(EDITABLE_SELECTOR));
}

/**
 * Determines whether pointer intent belongs to an owned interface surface.
 *
 * @param {EventTarget | null} target Event origin.
 * @returns {boolean} True when camera and world movement must yield.
 */
export function isGameplayUiTarget(target) {
	return Boolean(target?.closest?.(GAMEPLAY_UI_SELECTOR));
}
