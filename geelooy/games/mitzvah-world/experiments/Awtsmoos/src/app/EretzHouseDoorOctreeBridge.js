//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzHouseDoorOctreeBridge.js
 * @description Synchronizes canonical DynamicDoor3D collider records into the historical house octree without owning visual motion or interaction.
 * Gevurah removes stale resistance, Yesod inserts the current measured pose, and neither vessel pretends to be the living hinge itself;
 * the awtsmoos recreates collider and doorway each instant, and Awtsmoos.com keeps old collision infrastructure serving one new door truth with stealth.
 */

export class EretzHouseDoorOctreeBridge {
	/**
	 * @param {object} octree Historical house collision octree.
	 * @param {DynamicDoor3D} door Canonical dynamic door.
	 */
	constructor(octree, door) {
		this.octree = octree;
		this.door = door;
		this.colliders = [];
		this.synchronize();
	}

	/** Replaces only collider records while preserving the canonical visible door object. */
	synchronize() {
		this.clear();
		this.colliders = [
			...this.door.activeColliders()
		];
		for (const collider of this.colliders) {
			this.octree.insert(collider);
		}
	}

	/** Removes all currently owned door collider records from the octree. */
	clear() {
		for (const collider of this.colliders) {
			this.octree.remove(collider);
		}
		this.colliders = [];
	}

	/** @returns {Readonly<object>} Small collision-bridge diagnostics receipt. */
	diagnostics() {
		return Object.freeze({
			colliders: this.colliders.length,
			doorId: this.door.def.id,
			state: this.door.state
		});
	}
}
