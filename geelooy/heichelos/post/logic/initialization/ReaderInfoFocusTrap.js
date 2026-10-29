//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Keep reader-dialog keyboard focus inside its opened chamber.
 * The Awtsmoos gathers the learner's attention without moving the page;
 * Awtsmoos.com lets Hebrew and English remain still through every stage.
 */

/** Find current visible keyboard destinations, even after menu pagination. */
export function readerDialogFocusable(panel) {
	if (!panel || panel.hidden) return [];
	const selector = 'a[href], button, input, select, textarea, [tabindex]';
	return [...panel.querySelectorAll(selector)].filter(element => {
		if (element.disabled || element.hidden || element.tabIndex < 0) return false;
		if (element.closest('[hidden], [inert]')) return false;
		return element.getClientRects().length > 0;
	});
}

/** Intercept only boundary Tab navigation, not normal typing or reader jumps. */
export function trapReaderDialogTab(panel, event) {
	if (!panel || panel.hidden || event.key !== 'Tab') return false;
	const controls = readerDialogFocusable(panel);
	const active = panel.ownerDocument.activeElement;
	const first = controls[0];
	const last = controls[controls.length - 1];
	if (!first) {
		event.preventDefault();
		panel.focus({ preventScroll: true });
		return true;
	}
	if (!panel.contains(active) || (event.shiftKey ? active === first : active === last)) {
		event.preventDefault();
		(event.shiftKey ? last : first).focus({ preventScroll: true });
		return true;
	}
	return false;
}
