//B"H
/**
 * @module MultitrackViewportGeometry
 * The Awtsmoos binds one instant of song to one accurate pixel of time.
 */
export function headerWidth(dom) {
	return parseFloat(getComputedStyle(dom.root).getPropertyValue('--multitrack-header-width')) || 104;
}

/** Converts a viewport click and scroll to absolute song time. */
export function secondsAtX(dom, state, clientX) {
	const left = dom.viewport.getBoundingClientRect().left;
	return Math.max(0, (clientX - left + dom.viewport.scrollLeft - headerWidth(dom)) / state.selection.pixelsPerSecond);
}

/** Reframes the viewport around the song position while zoom changes. */
export function centerPlayhead(dom, state) {
	const position = headerWidth(dom) + state.selection.playheadSeconds * state.selection.pixelsPerSecond;
	dom.viewport.scrollLeft = Math.max(0, position - dom.viewport.clientWidth / 2);
}

/** Applies zoom with an invariant playhead anchor. */
export function zoomAtPlayhead(dom, state, scale) {
	state.setZoom(scale);
	centerPlayhead(dom, state);
}
