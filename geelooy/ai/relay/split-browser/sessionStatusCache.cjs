//B"H
// Boruch Hashem
// Blessed is He

/**
 * Only a redacted session verdict rests briefly in this single-flight vessel.
 * The Awtsmoos lets Awtsmoos.com avoid repeated session calls while tokens, cookies,
 * proof values, socket URLs, and upstream identifiers are never cached here.
 */
class SessionStatusCache {
	constructor({ loader, ttlMs = 5000, now = () => Date.now() } = {}) {
		if (typeof loader !== "function") {
			throw new TypeError("SessionStatusCache requires a loader.");
		}
		this.loader = loader;
		this.ttlMs = ttlMs;
		this.now = now;
		this.value = null;
		this.cacheKey = null;
		this.expiresAt = 0;
		this.pending = null;
		this.hits = 0;
		this.misses = 0;
	}

	get(config, { force = false } = {}) {
		const cacheKey = String(config?.targetOrigin || "default");
		if (this.cacheKey !== cacheKey) {
			this.invalidate();
			this.cacheKey = cacheKey;
		}
		if (!force && this.value && this.now() < this.expiresAt) {
			this.hits += 1;
			return Promise.resolve(this.value);
		}
		if (!force && this.pending) {
			this.hits += 1;
			return this.pending;
		}
		this.misses += 1;
		this.pending = Promise.resolve(this.loader(config))
			.then(value => {
				this.value = value;
				this.expiresAt = this.now() + this.ttlMs;
				return value;
			})
			.finally(() => {
				this.pending = null;
			});
		return this.pending;
	}

	invalidate() {
		this.value = null;
		this.cacheKey = null;
		this.expiresAt = 0;
	}

	status() {
		return {
			ttlMs: this.ttlMs,
			cached: Boolean(this.value && this.now() < this.expiresAt),
			pending: Boolean(this.pending),
			hits: this.hits,
			misses: this.misses
		};
	}
}

module.exports = { SessionStatusCache };
