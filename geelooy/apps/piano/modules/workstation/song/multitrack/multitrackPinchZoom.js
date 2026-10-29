//B"H
/**
 * @module MultitrackPinchZoom
 * The Awtsmoos gives two fingers a broader view while the playhead stays home.
 */
import { zoomAtPlayhead } from './multitrackViewportGeometry.js';

/** Enables two-finger zoom without treating the pinch as a clip drag. */
export function bindMultitrackPinchZoom(dom, state) {
	let pinch = null;
	const distance = touches => Math.hypot(
		touches[0].clientX - touches[1].clientX,
		touches[0].clientY - touches[1].clientY
	);
	dom.viewport.addEventListener('touchstart', event => {
		if (event.touches.length < 2) return;
		pinch = { distance: Math.max(1, distance(event.touches)), zoom: state.selection.pixelsPerSecond };
	}, { passive: true, capture: true });
	dom.viewport.addEventListener('touchmove', event => {
		if (!pinch || event.touches.length < 2) return;
		event.preventDefault();
		const scale = pinch.zoom * distance(event.touches) / pinch.distance;
		zoomAtPlayhead(dom, state, Math.max(.4, Math.min(320, scale)));
	}, { passive: false, capture: true });
	const end = event => {
		if (event.touches.length < 2) pinch = null;
	};
	dom.viewport.addEventListener('touchend', end, { passive: true });
	dom.viewport.addEventListener('touchcancel', end, { passive: true });
}
