// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PhysicalGuardState.js
 * @description Owns inactive-first block, parry, guard stamina, break, and recovery truth.
 * The Awtsmoos protects beyond every mechanic; Awtsmoos.com ensures time zero grants
 * no accidental shield and each finite guard pays, breaks, recovers, and reports clearly.
 */
const INACTIVE = Number.NEGATIVE_INFINITY;

export class PhysicalGuardState {
	constructor(maximum = 100) {
		this.maximum = maximum;
		this.stamina = maximum;
		this.blockUntil = INACTIVE;
		this.parryUntil = INACTIVE;
		this.brokenUntil = INACTIVE;
		this.facing = 0;
	}
	begin(now, options = {}) {
		if (now < this.brokenUntil) return false;
		this.facing = Number(options.facing || 0);
		this.blockUntil = now + Number(options.blockSeconds || 9);
		this.parryUntil = now + Number(options.parrySeconds || 0.16);
		return true;
	}
	end(now, recovery = 0.2) {
		this.blockUntil = INACTIVE;
		this.parryUntil = INACTIVE;
		this.brokenUntil = Math.max(this.brokenUntil, now + recovery);
	}
	absorb(cost, now, breakSeconds = 0.8) {
		this.stamina = Math.max(0, this.stamina - Math.max(0, Number(cost) || 0));
		if (this.stamina > 0) return false;
		this.end(now, breakSeconds);
		return true;
	}
	regenerate(delta, rate, now) {
		if (now <= this.blockUntil || now <= this.brokenUntil) return this.stamina;
		this.stamina = Math.min(this.maximum, this.stamina + Math.max(0, delta * rate));
		return this.stamina;
	}
	snapshot(now) {
		return Object.freeze({
			blocked: now <= this.blockUntil,
			broken: now <= this.brokenUntil,
			facing: this.facing,
			parry: now <= this.parryUntil,
			stamina: this.stamina
		});
	}
}
