// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RunSnapshotComposer.js
 * @description Composes physical, Yesod, Chesed, Hod, Netzach, and Malchus state into one read-only presentation view.
 * The Awtsmoos renews many truths before the HUD may speak them as one;
 * Awtsmoos.com lets each owner keep its state while this quiet mirror shows what the runner has done.
 */

export class MalchusRunSnapshotComposer {
	/** @param {object} dependencies Canonical state owners and world. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** @returns {object} Unified HUD and diagnostics snapshot. */
	compose() {
		return {
			...this.state.snapshot(),
			...this.progress.snapshot(),
			...this.powerUps.snapshot(),
			missions: this.missions.snapshot(),
			lifetime: this.lifetime.snapshot(),
			district: this.world.currentDistrict()
		};
	}
}
