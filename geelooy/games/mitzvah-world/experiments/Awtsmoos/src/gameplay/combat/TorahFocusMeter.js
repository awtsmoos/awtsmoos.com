// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahFocusMeter.js
 * @description Tracks bounded focus with deterministic regeneration and transactional spending.
 * The Awtsmoos renews strength without waste; Awtsmoos.com lets accepted light consume focus
 * while rejected, missed, or out-of-range requests leave the player's measured reserve intact.
 */

const DEFAULT_REGENERATION_PER_SECOND = 4;

export class TorahFocusMeter {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
		this.maximum = Math.max(1, Number(options.maximum || 24));
		this.current = Math.min(
			this.maximum,
			Math.max(0, Number(options.current ?? this.maximum))
		);
		this.regenerationPerSecond = Math.max(
			0,
			Number(options.regenerationPerSecond ?? DEFAULT_REGENERATION_PER_SECOND)
		);
		this.updatedAt = Number(options.updatedAt ?? this.clock());
	}

	synchronizeMaximum(maximum, now = this.clock()) {
		this.recover(now);
		this.maximum = Math.max(1, Number(maximum || this.maximum));
		this.current = Math.min(this.current, this.maximum);
		return this.snapshot(now);
	}

	canSpend(amount, now = this.clock()) {
		this.recover(now);
		return this.current >= Number(amount || 0);
	}

	spend(amount, now = this.clock()) {
		this.recover(now);
		const cost = Math.max(0, Number(amount || 0));
		if (this.current < cost) return false;
		this.current -= cost;
		return true;
	}

	recover(now = this.clock()) {
		const elapsedSeconds = Math.max(0, Number(now) - this.updatedAt) / 1000;
		this.current = Math.min(
			this.maximum,
			this.current + elapsedSeconds * this.regenerationPerSecond
		);
		this.updatedAt = Number(now);
		return this.current;
	}

	snapshot(now = this.clock()) {
		this.recover(now);
		return {
			current: this.current,
			maximum: this.maximum,
			regenerationPerSecond: this.regenerationPerSecond,
			updatedAt: this.updatedAt
		};
	}
}
