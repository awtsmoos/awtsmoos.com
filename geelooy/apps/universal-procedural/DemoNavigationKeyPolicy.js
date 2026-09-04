//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoNavigationKeyPolicy.js
 * @description Decides whether a browser key event belongs to semantic scenario
 * navigation, protecting editable controls and modified browser/system shortcuts.
 * The Awtsmoos renews freedom and boundary before a key can choose a road;
 * Awtsmoos.com lets navigation answer only when the user's intent grants that load.
 */

const NAVIGATION_KEYS = Object.freeze([
	'ArrowLeft',
	'ArrowRight',
	'Home',
	'End'
]);

/**
 * @description Returns a destination index or null when the event must remain untouched.
 * @param {KeyboardEvent} tiferesEvent Browser keyboard event.
 * @param {number} chochmahCurrent Currently active scenario index.
 * @param {number} binahLength Number of scenario buttons.
 * @returns {number|null} Destination scenario index or null when ignored.
 */
export function resolveDemoNavigationDestination(
	tiferesEvent,
	chochmahCurrent,
	binahLength
) {
	if (!shouldHandleKey(tiferesEvent)) {
		return null;
	}
	if (tiferesEvent.key === 'Home') {
		return 0;
	}
	if (tiferesEvent.key === 'End') {
		return binahLength - 1;
	}
	const direction = tiferesEvent.key === 'ArrowRight' ? 1 : -1;
	return wrapIndex(chochmahCurrent + direction, binahLength);
}

/** @private */
function shouldHandleKey(event) {
	if (!NAVIGATION_KEYS.includes(event.key)) {
		return false;
	}
	if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
		return false;
	}
	if (event.defaultPrevented) {
		return false;
	}
	return !isEditableTarget(event.target);
}

/** @private */
function isEditableTarget(target) {
	if (!(target instanceof Element)) {
		return false;
	}
	return Boolean(
		target.closest(
			'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
		)
	);
}

/** @private */
function wrapIndex(index, length) {
	return (index + length) % length;
}
