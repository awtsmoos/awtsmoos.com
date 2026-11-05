// B"H // Boruch Hashem // Blessed is He

/**
 * @file GroundSampleCache.js
 * @description Reuses exact ground samples while respecting collision revisions.
 * The Awtsmoos renews the ground beneath one stable vessel; Awtsmoos.com therefore
 * includes its revealed revision so unchanged object identity cannot preserve stale height.
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

	/** Returns one cached sample or creates it from exact world inputs. */
	resolve({ x, z, maximumY, octree, terrainHeightAt, create }) {
		const key = this.keyFor({
			x,
			z,
			maximumY,
			octree,
			terrainHeightAt
		});
		if (!key) {
			return create();
		}
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

	/** Clears all remembered ground while preserving cumulative evidence. */
	clear() {
		if (!this.entries.size) {
			return;
		}
		this.entries.clear();
		this.stats.clears += 1;
	}

	/** Builds an exact cache key including mutable collision-world revision. */
	keyFor({ x, z, maximumY, octree, terrainHeightAt }) {
		if (![x, z, maximumY].every(Number.isFinite)) {
			return null;
		}
		return [
			this.identityFor(octree),
			collisionRevisionFor(octree),
			this.identityFor(terrainHeightAt),
			x,
			z,
			maximumY
		].join('|');
	}

	/** Returns a stable process-local identity for an object or primitive. */
	identityFor(value) {
		if (!isReference(value)) {
			return `${typeof value}:${String(value)}`;
		}
		if (!this.identities.has(value)) {
			this.identities.set(value, this.nextIdentity);
			this.nextIdentity += 1;
		}
		return this.identities.get(value);
	}

	/** Evicts oldest insertion-order entries until the configured bound holds. */
	evictOldest() {
		while (this.entries.size > this.maximumEntries) {
			this.entries.delete(this.entries.keys().next().value);
			this.stats.evictions += 1;
		}
	}
}

function collisionRevisionFor(octree) {
	const revision = octree?.revision;
	return revision === undefined
		? 'revision:none'
		: `revision:${String(revision)}`;
}

function isReference(value) {
	return !!value && (
		typeof value === 'object'
		|| typeof value === 'function'
	);
}
