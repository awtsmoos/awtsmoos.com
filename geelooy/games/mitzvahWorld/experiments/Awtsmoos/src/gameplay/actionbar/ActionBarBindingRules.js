// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarBindingRules.js
 * @description Pure keyboard and gamepad mappings for twelve readable action slots per row.
 */

const KEY_CODES = Object.freeze([
	'Digit1',
	'Digit2',
	'Digit3',
	'Digit4',
	'Digit5',
	'Digit6',
	'Digit7',
	'Digit8',
	'Digit9',
	'Digit0',
	'Minus',
	'Equal'
]);
const KEY_LABELS = Object.freeze(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '−', '=']);
const GAMEPAD_BUTTONS = Object.freeze([0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 8, 9]);

export const DEFAULT_ACTION_BAR_BINDINGS = Object.freeze({
	gamepadButtons: GAMEPAD_BUTTONS,
	keyboardCodes: KEY_CODES
});

export function keyboardActionSlot(event, options = {}) {
	if (!event || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return null;
	if (isEditableTarget(event.target)) return null;
	const codes = options.keyboardCodes || KEY_CODES;
	const localIndex = codes.indexOf(event.code);
	if (localIndex < 0) return null;
	return localIndex + rowOffset(options.secondRow);
}

export function gamepadActionSlot(buttonIndex, options = {}) {
	if (!Number.isInteger(buttonIndex) || buttonIndex < 0) return null;
	const buttons = options.gamepadButtons || GAMEPAD_BUTTONS;
	const localIndex = buttons.indexOf(buttonIndex);
	if (localIndex < 0) return null;
	return localIndex + rowOffset(options.secondRow);
}

export function actionBarKeyLabel(slotIndex) {
	if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= 24) return '';
	return KEY_LABELS[slotIndex % KEY_LABELS.length];
}

function rowOffset(secondRow) {
	return secondRow ? KEY_CODES.length : 0;
}

function isEditableTarget(target) {
	if (!target) return false;
	if (target.isContentEditable) return true;
	const tagName = String(target.tagName || '').toLowerCase();
	return tagName === 'input' || tagName === 'select' || tagName === 'textarea';
}
