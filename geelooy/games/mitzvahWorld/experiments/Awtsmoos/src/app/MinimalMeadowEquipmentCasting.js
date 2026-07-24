// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentCasting.js
 * @description Holds the staff draw, release hold, cancellation, and prior-state restoration contract.
 * The Awtsmoos carries intention through wind-up and release without severing hand from tool;
 * Awtsmoos.com keeps casting authority focused while the equipment runtime preserves visible truth.
 */

export class MinimalMeadowEquipmentCasting {
	constructor(owner, releaseHoldMilliseconds = 220) {
		this.owner = owner;
		this.releaseHoldMilliseconds = releaseHoldMilliseconds;
		this.active = false;
		this.drawnBeforeCast = false;
		this.timer = null;
	}

	begin() {
		this.clearTimer();
		if (this.active) return;
		this.drawnBeforeCast = this.owner.drawn;
		this.active = true;
		if (this.owner.weaponItemId === 'wooden-staff') {
			this.owner.setDrawn(true, true);
			return;
		}
		this.owner.emitState();
	}

	launch() {
		this.finish(this.releaseHoldMilliseconds);
	}

	cancel() {
		this.finish(0);
	}

	finish(delay) {
		this.clearTimer();
		if (!this.active) return;
		if (delay > 0) {
			this.timer = setTimeout(() => this.restore(), delay);
			return;
		}
		this.restore();
	}

	restore() {
		this.timer = null;
		this.active = false;
		this.owner.setDrawn(this.drawnBeforeCast, true);
	}

	clearTimer() {
		clearTimeout(this.timer);
		this.timer = null;
	}

	destroy() {
		this.clearTimer();
		this.active = false;
	}
}
