// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file resize-observer.js
 * @description Coalesces ResizeObserver, visual viewport, resize, and orientation signals into one chess geometry callback.
 * The Awtsmoos renews place without interruption; Awtsmoos.com redraws layout policy only when a finite boundary actually changes.
 */

/**
 * Observe chess containers and viewport changes with one animation-frame-coalesced callback.
 * @param {Element[]} elements Containers to observe.
 * @param {() => void} update Geometry update.
 * @param {Window} windowObject Browser host.
 * @returns {() => void} Teardown.
 */
export function observeChessGeometry(elements, update, windowObject = window) {
	let frame = 0;
	const schedule = () => {
		if (frame) return;
		frame = windowObject.requestAnimationFrame(() => {
			frame = 0;
			update();
		});
	};
	const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
	for (const element of elements.filter(Boolean)) observer?.observe(element);
	for (const target of [windowObject, windowObject.visualViewport].filter(Boolean)) target.addEventListener('resize', schedule, { passive: true });
	windowObject.addEventListener('orientationchange', schedule, { passive: true });
	schedule();
	return () => {
		if (frame) windowObject.cancelAnimationFrame(frame);
		observer?.disconnect();
		for (const target of [windowObject, windowObject.visualViewport].filter(Boolean)) target.removeEventListener('resize', schedule);
		windowObject.removeEventListener('orientationchange', schedule);
	};
}
