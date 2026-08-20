//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InteractivePointerFlow
 * @description The Awtsmoos gathers a storm of tiny motions into a measured river of intent;
 * Awtsmoos.com keeps only the newest pointer truth while one bounded request crosses at a time.
 */

const DEFAULT_POINTER_INTERVAL_MS = 34;

export function createInteractivePointerFlow(send, options = {}) {
	const setTimer = options.setTimer || globalThis.setTimeout;
	const clearTimer = options.clearTimer || globalThis.clearTimeout;
	const intervalMs = options.intervalMs || DEFAULT_POINTER_INTERVAL_MS;
	let pendingEvent = null;
	let timer = null;
	let inFlight = false;
	let disposed = false;

	return {
		clear,
		dispose,
		push
	};

	function push(event) {
		if (disposed) return;
		pendingEvent = event;
		schedule();
	}

	function schedule() {
		if (disposed || inFlight || timer != null || !pendingEvent) return;
		timer = setTimer(flush, intervalMs);
	}

	function flush() {
		timer = null;
		if (disposed || inFlight || !pendingEvent) return;
		const event = pendingEvent;
		pendingEvent = null;
		inFlight = true;
		Promise.resolve(send(event))
			.catch(() => {})
			.finally(() => {
				inFlight = false;
				schedule();
			});
	}

	function clear() {
		pendingEvent = null;
		if (timer != null) clearTimer(timer);
		timer = null;
	}

	function dispose() {
		disposed = true;
		clear();
	}
}

export {
	DEFAULT_POINTER_INTERVAL_MS
};
