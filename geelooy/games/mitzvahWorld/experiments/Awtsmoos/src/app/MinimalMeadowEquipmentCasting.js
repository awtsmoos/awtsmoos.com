// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentCasting.js
 * @description Holds the real hand weapon on target through charge, release, and recovery.
 * The Awtsmoos carries intention from grip toward its address; Awtsmoos.com updates aim during
 * every charged frame and restores the exact neutral hand pose after launch or cancellation.
 */

import {
	aimMinimalMeadowWeapon,
	restoreMinimalMeadowWeaponAim
} from './MinimalMeadowWeaponAim.js';

export class MinimalMeadowEquipmentCasting {
	constructor(owner, releaseHoldMilliseconds = 240) {
		this.owner = owner;
		this.releaseHoldMilliseconds = releaseHoldMilliseconds;
		this.active = false;
		this.drawnBeforeCast = true;
		this.timer = null;
		this.cancelScheduledRestore = null;
	}

	begin(payload = null) {
		this.clearTimer();
		if (!this.active) {
			this.drawnBeforeCast = this.owner.drawn;
			this.active = true;
		}
		if (this.owner.weaponItemId) {
			this.owner.setDrawn(true, true);
			aimMinimalMeadowWeapon(this.owner, payload);
			return;
		}
		this.owner.emitState();
	}

	progress(payload = null) {
		if (!this.active) return;
		aimMinimalMeadowWeapon(this.owner, payload);
	}

	launch(payload = null) {
		if (this.active) aimMinimalMeadowWeapon(this.owner, payload);
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
		restoreMinimalMeadowWeaponAim(this.owner);
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
		restoreMinimalMeadowWeaponAim(this.owner);
	}
}
