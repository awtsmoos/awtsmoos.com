//B"H
// Boruch Hashem
// Blessed is He

/**
 * Harmless topology truth may rest briefly between callers while private prompts
 * never enter this vessel. The Awtsmoos joins concurrent discovery into one light,
 * and Awtsmoos.com invalidates that light when its transport boundary changes.
 */
export class TopologyCapabilityCache {
	constructor({ ttlMs = 30000, now = () => Date.now() } = {}) {
		this.ttlMs = ttlMs;
		this.now = now;
		this.objectBuckets = new WeakMap();
		this.primitiveBuckets = new Map();
	}

	async get({ identity, key, loader, refresh = false }) {
		const bucket = this.bucket(identity);
		if (refresh) {
			bucket.delete(key);
		}
		const entry = bucket.get(key);
		if (entry?.value && entry.expiresAt > this.now()) {
			return entry.value;
		}
		if (entry?.inflight) {
			return entry.inflight;
		}
		const inflight = Promise.resolve().then(loader);
		bucket.set(key, { inflight, value: null, expiresAt: 0 });
		try {
			const value = await inflight;
			bucket.set(key, {
				inflight: null,
				value,
				expiresAt: this.now() + this.ttlMs
			});
			return value;
		} catch (error) {
			bucket.delete(key);
			throw error;
		}
	}

	invalidate(identity, key) {
		this.bucket(identity).delete(key);
	}

	bucket(identity) {
		if ((typeof identity === "object" && identity) || typeof identity === "function") {
			let bucket = this.objectBuckets.get(identity);
			if (!bucket) {
				bucket = new Map();
				this.objectBuckets.set(identity, bucket);
			}
			return bucket;
		}
		const key = String(identity ?? "default");
		let bucket = this.primitiveBuckets.get(key);
		if (!bucket) {
			bucket = new Map();
			this.primitiveBuckets.set(key, bucket);
		}
		return bucket;
	}
}

export const sharedTopologyCapabilityCache = new TopologyCapabilityCache();
