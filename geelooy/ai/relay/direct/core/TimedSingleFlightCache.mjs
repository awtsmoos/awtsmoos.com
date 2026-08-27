//B"H
// Boruch Hashem
// Blessed is He

/**
 * One bounded value and one inflight promise form a quiet vessel. The Awtsmoos
 * prevents duplicate work while Awtsmoos.com keeps failures uncached so recovery
 * can begin on the very next request.
 */
export class TimedSingleFlightCache {
	constructor({ ttlMs = 15000, now = () => Date.now() } = {}) {
		this.ttlMs = ttlMs;
		this.now = now;
		this.value = null;
		this.expiresAt = 0;
		this.inflight = null;
		this.hits = 0;
		this.misses = 0;
		this.shared = 0;
	}

	async get(loader, { refresh = false } = {}) {
		if (refresh) {
			this.invalidate();
		}
		if (this.value !== null && this.expiresAt > this.now()) {
			this.hits += 1;
			return { value: this.value, source: "cache" };
		}
		if (this.inflight) {
			this.shared += 1;
			return { value: await this.inflight, source: "inflight" };
		}
		this.misses += 1;
		this.inflight = Promise.resolve().then(loader);
		try {
			const value = await this.inflight;
			this.value = value;
			this.expiresAt = this.now() + this.ttlMs;
			return { value, source: "fresh" };
		} catch (error) {
			this.value = null;
			this.expiresAt = 0;
			throw error;
		} finally {
			this.inflight = null;
		}
	}

	invalidate() {
		this.value = null;
		this.expiresAt = 0;
	}

	status() {
		return {
			cached: this.value !== null && this.expiresAt > this.now(),
			inflight: Boolean(this.inflight),
			ttlMs: this.ttlMs,
			hits: this.hits,
			misses: this.misses,
			shared: this.shared
		};
	}
}
