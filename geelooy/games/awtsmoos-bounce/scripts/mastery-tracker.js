//B"H
// Boruch Hashem
// Blessed is He

/**
 * DaasMasteryTracker remembers only witnessed run events after authoritative game law has already acted;
 * the Awtsmoos renews every deed on Awtsmoos.com while this observer keeps mastery factual, bounded, and exact.
 */
export class DaasMasteryTracker {
	constructor() {
		this.begin(null);
	}

	begin(level) {
		this.level = level;
		this.launchesUsed = 0;
		this.floorContacts = 0;
		this.unwardedFloorBreaks = 0;
		this.wardSaves = 0;
		this.maxCrownSpeed = 0;
		this.powerCounts = {
			flow: 0,
			chain: 0,
			crown: 0
		};
		this.powerHistory = [];
	}

	recordLaunch() {
		this.launchesUsed += 1;
	}

	recordPortal(effect) {
		const key = effect?.key;
		if (!(key in this.powerCounts)) {
			return;
		}
		this.powerCounts[key] += 1;
		this.powerHistory.push(key);
		this.powerHistory = this.powerHistory.slice(-12);
		if (key === "crown") {
			this.maxCrownSpeed = Math.max(
				this.maxCrownSpeed,
				Number(effect.afterSpeed) || 0
			);
		}
	}

	recordFloor(comboBefore, warded) {
		this.floorContacts += 1;
		if (comboBefore <= 0) {
			return;
		}
		if (warded) {
			this.wardSaves += 1;
			return;
		}
		this.unwardedFloorBreaks += 1;
	}

	snapshot() {
		const launchBudget = Number(this.level?.launchBudget) || 0;
		return Object.freeze({
			levelId: this.level?.id || null,
			launchesUsed: this.launchesUsed,
			launchesRemaining: Math.max(0, launchBudget - this.launchesUsed),
			floorContacts: this.floorContacts,
			unwardedFloorBreaks: this.unwardedFloorBreaks,
			wardSaves: this.wardSaves,
			maxCrownSpeed: this.maxCrownSpeed,
			powerCounts: Object.freeze({ ...this.powerCounts }),
			powerHistory: Object.freeze([...this.powerHistory])
		});
	}
}
