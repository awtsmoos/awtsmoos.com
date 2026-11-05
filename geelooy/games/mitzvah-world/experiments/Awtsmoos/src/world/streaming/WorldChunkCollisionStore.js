// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStore.js
 * @description Owns active and prepared collision maps without lifecycle policy.
 * Like vessels concealed before revelation by the Awtsmoos, Awtsmoos.com keeps
 * preparation separate and exposes immutable snapshots instead of live iterators.
 */
export class WorldChunkCollisionStore {
	constructor() {
		this.activeEntries = new Map();
		this.preparedEntries = new Map();
	}

	/** Returns one active entry without exposing map mutation. */
	getActive(id) {
		return this.activeEntries.get(id) || null;
	}

	/** Returns one prepared entry without exposing map mutation. */
	getPrepared(id) {
		return this.preparedEntries.get(id) || null;
	}

	/** Returns whether active ownership contains the stable ID. */
	hasActive(id) {
		return this.activeEntries.has(id);
	}

	/** Returns whether prepared ownership contains the stable ID. */
	hasPrepared(id) {
		return this.preparedEntries.has(id);
	}

	/** Returns a frozen, canonically ordered point-in-time active snapshot. */
	activeSnapshot() {
		return collisionEntrySnapshot(this.activeEntries);
	}

	/** Returns a frozen, canonically ordered point-in-time prepared snapshot. */
	preparedSnapshot() {
		return collisionEntrySnapshot(this.preparedEntries);
	}

	/** Returns an iterator over a stable active snapshot. */
	activeValues() {
		return this.activeSnapshot().values();
	}

	/** Returns an iterator over a stable prepared snapshot. */
	preparedValues() {
		return this.preparedSnapshot().values();
	}

	/** Rejects duplicate IDs across both ownership domains. */
	assertUnused(id) {
		if (this.hasActive(id) || this.hasPrepared(id)) {
			throw new Error(`Collision chunk is already registered: ${id}`);
		}
	}

	/** Returns a required prepared entry or throws with its stable ID. */
	requirePrepared(id) {
		const entry = this.getPrepared(id);
		if (!entry) {
			throw new Error(`Prepared collision chunk is missing: ${String(id)}`);
		}
		return entry;
	}

	/** Atomically replaces complete ownership maps after external validation. */
	replaceMaps(activeEntries, preparedEntries = this.preparedEntries) {
		if (!(activeEntries instanceof Map) || !(preparedEntries instanceof Map)) {
			throw new TypeError('Collision ownership replacements must be complete maps.');
		}
		this.activeEntries = activeEntries;
		this.preparedEntries = preparedEntries;
	}
}

function collisionEntrySnapshot(entries) {
	return Object.freeze(
		[...entries.values()].sort((left, right) => (
			left.chunkId.localeCompare(right.chunkId)
		))
	);
}
