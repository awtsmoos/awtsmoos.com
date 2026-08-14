// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HebrewWordActions
 * @description
 * The Awtsmoos renews the reader without stealing an ordinary click;
 * at Awtsmoos.com deliberate intent alone reveals the action brick.
 * A long press, a true context request, or an accessible key may open the gate,
 * while simple reading remains quiet, flowing, and free from accidental state.
 */
import { showCustomContextMenu } from '../../functions/ui/contextMenu.js';
import { isWordSelectionActive } from '../../functions/ui/selection/selectionMode.js';
import { tokenRange } from '../../functions/ui/context/hebrewToken.js';
import { LongPressIntent } from './LongPressIntent.js';

/**
 * Determines whether the event began on a control whose own interaction
 * must remain untouched by the reader-actions layer.
 *
 * @param {EventTarget|null} target Potential DOM event target.
 * @returns {boolean} True when the target belongs to an interactive control.
 */
function isInteractiveTarget(target) {
	return Boolean(target?.closest?.('a,button,input,textarea,select,[contenteditable="true"]'));
}

/**
 * Opens the reader action menu unless explicit word-selection mode is active.
 *
 * @param {number} x Viewport x-coordinate.
 * @param {number} y Viewport y-coordinate.
 * @param {Event} event Event that intentionally requested the menu.
 * @returns {void}
 */
function openReaderActions(x, y, event) {
	if (isWordSelectionActive()) {
		return;
	}
	showCustomContextMenu(x, y, event);
}

/**
 * Opens reader actions for pointer intent only when the pointer rests over
 * an actual Hebrew token. This keeps long presses and context clicks precise.
 *
 * @param {number} x Viewport x-coordinate.
 * @param {number} y Viewport y-coordinate.
 * @param {Event} event Pointer-originating event.
 * @returns {void}
 */
function openTokenReaderActions(x, y, event) {
	if (isInteractiveTarget(event.target) || !tokenRange(x, y)) {
		return;
	}
	openReaderActions(x, y, event);
}

/**
 * Binds deliberate Hebrew reader actions without hijacking ordinary clicks.
 *
 * @returns {void}
 */
export function setupHebrewWordActions() {
	const root = document.getElementById('realPost');
	if (!root || root.dataset.tanachActionsBound) {
		return;
	}
	root.dataset.tanachActionsBound = 'true';

	new LongPressIntent({
		isBlocked: isWordSelectionActive,
		onIntent: openTokenReaderActions
	}).connect(root);

	root.addEventListener('contextmenu', event => {
		if (isWordSelectionActive() || isInteractiveTarget(event.target)) {
			return;
		}
		if (!tokenRange(event.clientX, event.clientY)) {
			return;
		}
		event.preventDefault();
		openReaderActions(event.clientX, event.clientY, event);
	});

	root.addEventListener('keydown', event => {
		if (isWordSelectionActive()) {
			return;
		}
		const isActivation = event.key === 'Enter' || event.key === ' ';
		const context = event.target.closest?.(
			'[data-awtsmoos-text-id],.section,.sub-awtsmoos'
		);
		if (!isActivation || !context) {
			return;
		}
		event.preventDefault();
		const rectangle = context.getBoundingClientRect();
		openReaderActions(rectangle.left + 8, rectangle.top + 8, event);
	});
}
