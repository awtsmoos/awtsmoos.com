// B"H

/**
 * Remembers exact ground revelations within a bounded vessel. Coordinates are
 * never rounded: a tread, bank, or threshold keeps its own measured identity.
 */
export class GroundSampleCache {
	constructor({ maximumEntries = 192 } = {}) {
		this.maximumEntries = maximumEntries;
		this.entries = new Map();
		this.identities = new WeakMap();
		this.nextIdentity = 1;
		this.stats = {
			hits: 0,
			misses: 0,
			evictions: 0,
			clears: 0
		};
	}

	resolve({ x, z, maximumY, octree, terrainHeightAt, create }) {
		const key = this.keyFor({
			x,
			z,
			maximumY,
			octree,
			terrainHeightAt
		});
		if (!key) return create();
		if (this.entries.has(key)) {
			this.stats.hits += 1;
			return this.entries.get(key);
		}
		this.stats.misses += 1;
		const sample = create();
		this.entries.set(key, sample);
		this.evictOldest();
		return sample;
	}

	clear() {
		if (!this.entries.size) return;
		this.entries.clear();
		this.stats.clears += 1;
	}

	keyFor({ x, z, maximumY, octree, terrainHeightAt }) {
		if (![x, z, maximumY].every(Number.isFinite)) return null;
		return [
			this.identityFor(octree),
			this.identityFor(terrainHeightAt),
			x,
			z,
			maximumY
		].join('|');
	}

	identityFor(value) {
		if (!isReference(value)) return `${typeof value}:${String(value)}`;
		if (!this.identities.has(value)) {
			this.identities.set(value, this.nextIdentity);
			this.nextIdentity += 1;
		}
		return this.identities.get(value);
	}

	evictOldest() {
		while (this.entries.size > this.maximumEntries) {
			this.entries.delete(this.entries.keys().next().value);
			this.stats.evictions += 1;
		}
	}
}

function isReference(value) {
	return !!value && (
		typeof value === 'object'
		|| typeof value === 'function'
	);
}
