// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldLocalCollisionMutationQueue.js
 * @description Applies bounded octree additions and removals without shifting large arrays.
 * The Awtsmoos advances each vessel by remembered place; Awtsmoos.com spends no needless motion
 * reshuffling yesterday's queue, so every measured operation serves the player's living notion.
 */

export class WorldLocalCollisionMutationQueue {
	constructor() {
		this.additions = [];
		this.removals = [];
		this.additionIndex = 0;
		this.removalIndex = 0;
	}

	/** Replaces obsolete work with the newest player-centered plan. */
	reset(additions, removals) {
		this.additions = [...additions];
		this.removals = [...removals];
		this.additionIndex = 0;
		this.removalIndex = 0;
	}

	/** Applies additions first, then hysteresis removals, up to the supplied budget. */
	process({ activeTriangles, budget, octree, onInsert, onRemove }) {
		let processed = 0;
		while (processed < budget && this.additionIndex < this.additions.length) {
			const triangle = this.additions[this.additionIndex++];
			if (!activeTriangles.has(triangle) && octree.insert(triangle)) {
				activeTriangles.add(triangle);
				onInsert();
			}
			processed += 1;
		}
		while (
			processed < budget
			&& this.additionIndex >= this.additions.length
			&& this.removalIndex < this.removals.length
		) {
			const triangle = this.removals[this.removalIndex++];
			if (activeTriangles.has(triangle) && octree.remove(triangle)) {
				activeTriangles.delete(triangle);
				onRemove();
			}
			processed += 1;
		}
		return processed;
	}

	diagnostics() {
		return Object.freeze({
			pendingAdditions: Math.max(0, this.additions.length - this.additionIndex),
			pendingRemovals: Math.max(0, this.removals.length - this.removalIndex)
		});
	}
}
