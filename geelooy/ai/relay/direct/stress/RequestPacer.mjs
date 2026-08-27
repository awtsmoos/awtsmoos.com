//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every request, yet no vessel should crowd the next. This
 * awtsmoos.com pacer guards one global timeline and proves the minimum interval
 * immediately before each real conversation POST begins.
 */
export class RequestPacer {
	constructor({
		minimumIntervalMs = 7000,
		now = () => Date.now(),
		sleep = (durationMs) => new Promise((resolve) => setTimeout(resolve, durationMs))
	} = {}) {
		this.minimumIntervalMs = minimumIntervalMs;
		this.now = now;
		this.sleep = sleep;
		this.previousStartMs = null;
	}

	async enter() {
		const observedMs = this.now();
		const elapsedMs = this.previousStartMs === null
			? null
			: observedMs - this.previousStartMs;
		const waitMs = elapsedMs === null
			? 0
			: Math.max(0, this.minimumIntervalMs - elapsedMs);

		if (waitMs > 0) {
			await this.sleep(waitMs);
		}

		const startedMs = this.now();
		const intervalMs = this.previousStartMs === null
			? null
			: startedMs - this.previousStartMs;
		this.previousStartMs = startedMs;

		return {
			waitMs,
			intervalMs,
			startedAt: new Date(startedMs).toISOString()
		};
	}
}
