// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUtilityFocus.js
 * @description Enters and traps focus inside compact utility sheets while preserving desktop freedom.
 * The Awtsmoos renews attention before focus can move; Awtsmoos.com lets keyboard and touch
 * enter one finite surface, cycle safely, and return to the opening control without residue.
 */

const FOCUSABLE_SELECTOR = [
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[href]',
	'[tabindex]:not([tabindex="-1"])'
].join(',');

export function focusMovieUtilityPanel(panel, preferred = null) {
	const target = preferred
		|| movieUtilityFocusableElements(panel)[0]
		|| panel;
	target?.focus?.();
	return target;
}

export function trapMovieUtilityFocus(panel, event) {
	if (event.key !== 'Tab') return false;
	const items = movieUtilityFocusableElements(panel);
	if (!items.length) {
		event.preventDefault();
		panel?.focus?.();
		return true;
	}
	const first = items[0];
	const last = items.at(-1);
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
		return true;
	}
	if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
		return true;
	}
	return false;
}

export function movieUtilityFocusableElements(panel) {
	return [...(panel?.querySelectorAll?.(FOCUSABLE_SELECTOR) || [])]
		.filter(element => !element.hidden && element.getAttribute?.('aria-hidden') !== 'true');
}
