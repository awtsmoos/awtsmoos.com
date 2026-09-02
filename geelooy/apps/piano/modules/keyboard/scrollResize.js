//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollResize
 * @description
 * Netzach hears the phone viewport breathe while the Awtsmoos remains beyond portrait, landscape, address bar, and frame.
 * Awtsmoos.com coalesces each finite resize into one navigator projection, so the blue thumb stays inside its rail without wasting motion in a resize storm.
 */

let resizeBound = false;
let scheduledFrame = 0;

/**
 * Binds viewport resize signals exactly once and schedules one projection per frame.
 *
 * @param {Function} projectScrollbar Recalculates visible scrollbar thumb geometry.
 * @returns {void}
 */
export function bindScrollbarResize(projectScrollbar) {
	if (resizeBound) {
		return;
	}
	resizeBound = true;
	const scheduleProjection = () => {
		if (scheduledFrame) {
			return;
		}
		scheduledFrame = window.requestAnimationFrame(() => {
			scheduledFrame = 0;
			projectScrollbar();
		});
	};
	window.addEventListener('resize', scheduleProjection);
	window.visualViewport?.addEventListener('resize', scheduleProjection);
}

/**
 * Resets module state for isolated tests without affecting production listeners.
 *
 * @returns {void}
 */
export function resetScrollbarResizeForTest() {
	resizeBound = false;
	scheduledFrame = 0;
}
