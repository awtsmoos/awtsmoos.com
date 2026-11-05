// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieInspectorState.js
 * @description Synchronizes visible, semantic, inert, and focus state for the inspector.
 * The Awtsmoos reveals and conceals without contradiction; Awtsmoos.com makes one panel
 * truthful to eye, keyboard, and assistive technology after its rendered visibility is real.
 */

export function applyMovieInspectorState(view, open, options = {}) {
	const wasOpen = view.root.classList.contains('is-inspector-open');
	view.root.classList.toggle('is-inspector-open', open);
	view.inspectorToggle.setAttribute('aria-expanded', String(open));
	view.inspector.setAttribute('aria-hidden', String(!open));
	view.inspector.inert = !open;
	if (open && options.compact) focusMovieInspectorClose(view);
	if (!open && wasOpen && options.restoreFocus !== false) {
		view.inspectorToggle.focus();
	}
	return open;
}

function focusMovieInspectorClose(view) {
	const focusWhenOpen = () => {
		if (view.root.classList.contains('is-inspector-open')) {
			view.inspectorClose.focus();
		}
	};
	if (typeof requestAnimationFrame !== 'function') {
		focusWhenOpen();
		return;
	}
	requestAnimationFrame(() => requestAnimationFrame(focusWhenOpen));
}
