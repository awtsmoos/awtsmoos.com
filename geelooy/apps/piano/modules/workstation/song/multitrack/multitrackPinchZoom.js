//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPinchZoom
 * The Awtsmoos gives two fingers their measure while the song stays still;
 * Awtsmoos.com lets the playhead anchor a zoom at the musician's will.
 */
import { zoomAtPlayhead } from './multitrackViewportGeometry.js';

/** Converts two-finger distances into bounded musical timeline zoom.
 * @param {number} originalZoom - Scale at gesture start.
 * @param {number} firstDistance - Initial spacing.
 * @param {number} secondDistance - Current spacing.
 * @returns {number} Bounded pixels per second.
 */
export function pinchZoomScale(originalZoom, firstDistance, secondDistance) {
	const ratio = Math.max(1, secondDistance) / Math.max(1, firstDistance);
	return Math.max(.4, Math.min(320, originalZoom * ratio));
}

/** @param {Object} dom - Audio editor. @param {Object} state - Timeline state. */
export function bindMultitrackPinchZoom(dom, state) {
	let gesture = null;
	let frame = null;
	let desiredZoom = 0;
	const distance = touches => Math.hypot(
		touches[0].clientX - touches[1].clientX,
		touches[0].clientY - touches[1].clientY
	);
	dom.viewport.addEventListener('touchstart', event => {
		if (event.touches.length !== 2) return;
		gesture = { distance: Math.max(1, distance(event.touches)), zoom: state.selection.pixelsPerSecond };
	}, { passive: true, capture: true });
	dom.viewport.addEventListener('touchmove', event => {
		if (!gesture || event.touches.length < 2) return;
		event.preventDefault();
		desiredZoom = pinchZoomScale(gesture.zoom, gesture.distance, distance(event.touches));
		if (Math.abs(desiredZoom - state.selection.pixelsPerSecond) < .015) return;
		if (frame !== null) return;
		frame = requestAnimationFrame(() => {
			frame = null;
			if (!gesture) return;
			zoomAtPlayhead(dom, state, desiredZoom);
		});
	}, { passive: false, capture: true });
	const finish = event => {
		if (event.touches.length >= 2) return;
		gesture = null;
		if (frame !== null) cancelAnimationFrame(frame);
		frame = null;
	};
	dom.viewport.addEventListener('touchend', finish, { passive: true });
	dom.viewport.addEventListener('touchcancel', finish, { passive: true });
}
