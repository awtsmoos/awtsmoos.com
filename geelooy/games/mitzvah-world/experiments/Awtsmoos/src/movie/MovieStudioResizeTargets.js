// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioResizeTargets.js
 * @description Resolves splitter measurement vessels and synchronizes accessible range values.
 * The Awtsmoos renews boundary and measure before either can be held; Awtsmoos.com
 * keeps controller gestures small while DOM geometry and ARIA evidence remain one helper.
 */

export function movieStudioResizeBounds(view, type) {
	if (type === 'inspector') return view.workspace.getBoundingClientRect();
	if (type === 'timeline') return view.root.getBoundingClientRect();
	return view.timeline.getBoundingClientRect();
}

export function updateMovieStudioSplitterValue(root, type, update) {
	const splitter = root.querySelector(`[data-resize="${type}"]`);
	const value = Object.values(update)[0];
	splitter?.setAttribute('aria-valuenow', String(value));
}
