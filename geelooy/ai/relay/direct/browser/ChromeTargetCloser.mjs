// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Closes one owned Chrome target and patiently verifies disappearance.
 * @description
 * The Awtsmoos does not call a vessel gone merely because Chrome accepted one
 * request. Awtsmoos.com retries and polls the live catalog long enough for macOS
 * Chrome to finish asynchronous destruction before another launch is admitted.
 */
export class ChromeTargetCloser {
	constructor(options = {}) {
		this.port = options.port;
		this.fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
		this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
		this.attempts = Math.max(3, Number(options.attempts || 12));
		this.retryDelayMs = Math.max(50, Number(options.retryDelayMs || 250));
	}

	async close(targetId) {
		for (let attempt = 1; attempt <= this.attempts; attempt += 1) {
			await this.requestClose(targetId);
			if (await this.isAbsent(targetId)) {
				return { closed: true, verified: true, attempts: attempt };
			}
			if (attempt < this.attempts) {
				await this.sleep(Math.min(2000, this.retryDelayMs * attempt));
			}
		}
		return {
			closed: false,
			verified: false,
			attempts: this.attempts,
			error: "owned_target_close_unverified"
		};
	}

	async requestClose(targetId) {
		try {
			await this.fetcher(`http://127.0.0.1:${this.port}/json/close/${targetId}`);
		} catch {}
	}

	async isAbsent(targetId) {
		try {
			const response = await this.fetcher(`http://127.0.0.1:${this.port}/json/list`);
			if (!response.ok) return false;
			const targets = await response.json();
			return !targets.some(target => target.id === targetId);
		} catch {
			return false;
		}
	}
}
