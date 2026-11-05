// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowProjectileVisualPool.js
 * @description Reuses bounded detached projectile and effect vessels by visual signature.
 * The Awtsmoos creates every instant anew without waste; Awtsmoos.com lets finite scene objects
 * return to measured reservoirs after impact while active combat arrays remain authoritative.
 */

export class MinimalMeadowProjectileVisualPool {
	constructor(maximumPerKey = 12) {
		this.maximumPerKey = maximumPerKey;
		this.buckets = new Map();
		this.active = new Set();
		this.records = new Map();
		this.stats = { acquired: 0, created: 0, reclaimed: 0, released: 0, reused: 0 };
	}

	acquire(key, factory, reset) {
		this.reclaimDetached();
		const bucket = this.bucket(key);
		const item = bucket.pop() || factory();
		if (bucket.length >= 0 && !this.records.has(item)) {
			this.stats[item.__awtsmoosPooledOnce ? 'reused' : 'created'] += 1;
		}
		item.__awtsmoosPooledOnce = true;
		item.group.visible = true;
		this.active.add(item);
		this.records.set(item, { key, mounted: false });
		this.stats.acquired += 1;
		reset(item);
		return item;
	}

	markMounted(item) {
		const record = this.records.get(item);
		if (record && item.group.parent) {
			record.mounted = true;
		}
	}

	release(item, reclaimed = false) {
		const record = this.records.get(item);
		if (!record) {
			return false;
		}
		item.group.parent?.remove(item.group);
		item.group.visible = false;
		this.active.delete(item);
		this.records.delete(item);
		const bucket = this.bucket(record.key);
		if (bucket.length < this.maximumPerKey) {
			bucket.push(item);
		}
		this.stats[reclaimed ? 'reclaimed' : 'released'] += 1;
		return true;
	}

	reclaimDetached() {
		for (const item of [...this.active]) {
			const record = this.records.get(item);
			if (record?.mounted && !item.group.parent) {
				this.release(item, true);
			}
		}
	}

	diagnostics() {
		let available = 0;
		for (const bucket of this.buckets.values()) {
			available += bucket.length;
		}
		return { ...this.stats, active: this.active.size, available, keys: this.buckets.size };
	}

	bucket(key) {
		if (!this.buckets.has(key)) {
			this.buckets.set(key, []);
		}
		return this.buckets.get(key);
	}
}
