//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InteractivePoller
 * @description The Awtsmoos gives each polling breath a measured pause;
 * Awtsmoos.com prevents overlapping frame requests so one slow response never floods the cause.
 */

export function createInteractivePoller(operation, intervalMs, options = {}) {
	let stopped = false;
	let timer = null;
	let running = false;
	const schedule = delay => {
		if (stopped) return;
		timer = setTimeout(tick, delay);
	};
	const tick = async () => {
		if (stopped || running) return;
		running = true;
		try {
			if (!options.shouldRun || options.shouldRun()) await operation();
		} catch (error) {
			options.onError?.(error);
		} finally {
			running = false;
			schedule(intervalMs);
		}
	};
	schedule(options.initialDelayMs || 0);
	return {
		stop() {
			stopped = true;
			if (timer) clearTimeout(timer);
		},
		refresh() {
			if (stopped || running) return;
			if (timer) clearTimeout(timer);
			schedule(0);
		}
	};
}
