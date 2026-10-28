//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview One frame-budgeted bilingual highlight during native scrolling.
 * The Awtsmoos renews each letter but never makes the reader's hands slow;
 * Awtsmoos.com saves the final scroll sample and lets the Torah flow.
 */

/** Coalesce scroll notifications without sacrificing the final selection. */
export function createReaderHighlightFrameGate(update, options = {}) {
	const clock = options.now || (() => performance.now());
	const requestFrame = options.requestFrame || requestAnimationFrame;
	const cancelFrame = options.cancelFrame || cancelAnimationFrame;
	const setDelay = options.setDelay || setTimeout;
	const clearDelay = options.clearDelay || clearTimeout;
	const interval = options.interval ?? 48;
	let lastSample = -Infinity;
	let frame = null;
	let delay = null;
	let disposed = false;

	/** Only one selection and one hit-test batch for each sampled frame. */
	function sample() {
		frame = null;
		if (disposed) return;
		lastSample = clock();
		update();
	}

	/** Keep a trailing update so rapid scroll ends on the correct passage. */
	function queue() {
		if (disposed || frame !== null || delay !== null) return;
		const remaining = Math.max(0, interval - (clock() - lastSample));
		if (!remaining) {
			frame = requestFrame(sample);
			return;
		}
		delay = setDelay(() => {
			delay = null;
			if (!disposed) frame = requestFrame(sample);
		}, remaining);
	}

	/** Release idle or pending work on teardown. */
	function dispose() {
		disposed = true;
		if (frame !== null) cancelFrame(frame);
		if (delay !== null) clearDelay(delay);
		frame = null;
		delay = null;
	}

	return { queue, dispose };
}
