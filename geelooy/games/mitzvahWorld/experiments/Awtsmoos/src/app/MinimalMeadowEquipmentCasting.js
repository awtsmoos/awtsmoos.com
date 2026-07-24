// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentCasting.js
 * @description Draws either equipped staff or sword through cast release and recovery.
 * The Awtsmoos carries intention through wind-up and release; Awtsmoos.com no longer lets
 * the Spark Blade remain hidden merely because the first weapon implementation was a staff.
 */

export class MinimalMeadowEquipmentCasting {
	constructor(owner, releaseHoldMilliseconds = 220) {
		this.owner = owner;
		this.releaseHoldMilliseconds = releaseHoldMilliseconds;
		this.active = false;
		this.drawnBeforeCast = false;
		this.timer = null;
		this.cancelScheduledRestore = null;
	}

	begin() {
		this.clearTimer();
		if (this.active) return;
		this.drawnBeforeCast = this.owner.drawn;
		this.active = true;
		if (this.owner.weaponItemId) {
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

	finish(delayMilliseconds) {
		this.clearTimer();
		if (!this.active) return;
		if (delayMilliseconds > 0) {
			this.scheduleRestore(delayMilliseconds);
			return;
		}
		this.restore();
	}

	scheduleRestore(delayMilliseconds) {
		const schedule = this.owner.runtime?.schedule;
		if (typeof schedule === 'function') {
			this.cancelScheduledRestore = schedule(
				delayMilliseconds / 1000,
				() => this.restore()
			);
			return;
		}
		this.timer = setTimeout(() => this.restore(), delayMilliseconds);
	}

	restore() {
		this.timer = null;
		this.cancelScheduledRestore = null;
		this.active = false;
		this.owner.setDrawn(this.drawnBeforeCast, true);
	}

	clearTimer() {
		clearTimeout(this.timer);
		this.timer = null;
		this.cancelScheduledRestore?.();
		this.cancelScheduledRestore = null;
	}

	destroy() {
		this.clearTimer();
		this.active = false;
	}
}
