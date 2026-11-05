// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainCollisionLedger.js
 * @description Makes streamed collision insertion atomic and exactly reversible.
 * The Awtsmoos grants every visible trunk and carved letter a truthful boundary;
 * Awtsmoos.com records each inserted vessel so teardown can remove the same identity.
 */

export class DeferredTerrainCollisionLedger {
	constructor(octree, colliderStore = []) {
		this.octree = octree;
		this.colliderStore = colliderStore;
		this.inserted = [];
	}

	/** Inserts a complete collider set or rolls back the partial set. */
	insertAll(colliders = []) {
		const insertedNow = [];
		for (const collider of colliders) {
			if (!this.octree?.insert(collider)) {
				this.removeReferences(insertedNow);
				throw new Error('Deferred collider falls outside the world octree.');
			}
			insertedNow.push(collider);
			this.inserted.push(collider);
			if (!this.colliderStore.includes(collider)) {
				this.colliderStore.push(collider);
			}
		}
		return insertedNow;
	}

	/** Removes every collider in reverse installation order. */
	removeAll() {
		this.removeReferences([...this.inserted].reverse());
		this.inserted.length = 0;
	}

	/** Reports bounded collision-streaming evidence. */
	snapshot() {
		return Object.freeze({ insertedColliders: this.inserted.length });
	}

	removeReferences(colliders) {
		for (const collider of colliders) {
			this.octree?.remove?.(collider);
			removeExact(this.inserted, collider);
			removeExact(this.colliderStore, collider);
		}
	}
}

function removeExact(items, value) {
	const index = items.indexOf(value);
	if (index >= 0) items.splice(index, 1);
}

export default DeferredTerrainCollisionLedger;
