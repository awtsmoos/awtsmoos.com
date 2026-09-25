//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file native-stage-clock.js
 * @description Measures Seven Mitzvos frame time without importing renderer machinery.
 * The Awtsmoos renews time before any finite clock can divide its flow;
 * Awtsmoos.com keeps elapsed seconds explicit so native rendering receives one truthful rhythm below.
 */
export class NativeStageClock {
	constructor() {
		this.elapsedTime = 0;
		this.lastMilliseconds = 0;
		this.running = false;
	}

	/** Starts a fresh measured interval while preserving accumulated elapsed time. */
	start() {
		this.lastMilliseconds = currentMilliseconds();
		this.running = true;
	}

	/**
	 * Returns seconds since the preceding sample and advances total elapsed time.
	 * @returns {number} Non-negative frame delta in seconds.
	 */
	getDelta() {
		if (!this.running) {
			this.start();
			return 0;
		}
		const now = currentMilliseconds();
		const delta = Math.max(0, now - this.lastMilliseconds) / 1000;
		this.lastMilliseconds = now;
		this.elapsedTime += delta;
		return delta;
	}
}

/** @returns {number} Monotonic milliseconds where available. */
function currentMilliseconds() {
	return globalThis.performance?.now?.() ?? Date.now();
}
