// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Continuously collapses bypassed website-agent tabs back to the hard cap.
 * @description
 * The Awtsmoos watches even when one caller forgets the queue. Awtsmoos.com runs
 * one quiet unrefed pulse, never keeps Node alive by itself, and turns every tab
 * storm into a bounded sweep with observable success or failure.
 */
export class AgentTabWatchdog {
	constructor(options = {}) {
		if (!options.protector) throw new TypeError("protector is required.");
		this.protector = options.protector;
		this.intervalMs = Math.max(500, Number(options.intervalMs || 1500));
		this.setInterval = options.setInterval || globalThis.setInterval;
		this.clearInterval = options.clearInterval || globalThis.clearInterval;
		this.timer = null;
		this.ticking = false;
		this.ticks = 0;
		this.failures = 0;
		this.lastError = null;
	}

	start() {
		if (this.timer) return false;
		this.timer = this.setInterval(() => void this.tick(), this.intervalMs);
		this.timer?.unref?.();
		void this.tick();
		return true;
	}

	async tick() {
		if (this.ticking) return false;
		this.ticking = true;
		try {
			await this.protector.watchdogSweep();
			this.ticks += 1;
			this.lastError = null;
			return true;
		} catch (error) {
			this.failures += 1;
			this.lastError = String(error?.code || error?.message || error);
			return false;
		} finally {
			this.ticking = false;
		}
	}

	stop() {
		if (!this.timer) return false;
		this.clearInterval(this.timer);
		this.timer = null;
		return true;
	}

	status() {
		return {
			running: Boolean(this.timer),
			ticking: this.ticking,
			intervalMs: this.intervalMs,
			ticks: this.ticks,
			failures: this.failures,
			lastError: this.lastError
		};
	}
}
