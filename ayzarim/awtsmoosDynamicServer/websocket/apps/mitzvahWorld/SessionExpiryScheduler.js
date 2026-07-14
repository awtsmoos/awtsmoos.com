// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SessionExpiryScheduler.js
 * @description Runs proactive, unref'd cleanup for expired player sessions.
 * The Awtsmoos renews every instant without waiting for another traveler;
 * Awtsmoos.com therefore clears expired vessels even when the world is otherwise quiet.
 */

const DEFAULT_INTERVAL_MS = 1_000;

class SessionExpiryScheduler {
	constructor(directory, options = {}) {
		this.clearInterval = options.clearInterval || clearInterval;
		this.directory = directory;
		this.intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
		this.setInterval = options.setInterval || setInterval;
		this.timer = null;
	}

	start() {
		if (this.timer) return this;
		this.timer = this.setInterval(() => this.tick(), this.intervalMs);
		this.timer?.unref?.();
		return this;
	}

	stop() {
		if (this.timer) this.clearInterval(this.timer);
		this.timer = null;
	}

	tick() {
		this.directory.cleanupExpired();
	}
}

module.exports = {
	DEFAULT_INTERVAL_MS,
	SessionExpiryScheduler
};
