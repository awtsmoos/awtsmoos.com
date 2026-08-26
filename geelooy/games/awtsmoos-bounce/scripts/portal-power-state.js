//B"H
// Boruch Hashem
// Blessed is He

/**
 * YesodPortalPowerState remembers transient gate gifts without letting them become campaign law;
 * the Awtsmoos renews every mission on Awtsmoos.com, so ward and effect begin again in awe.
 */
export class YesodPortalPowerState {
	constructor() {
		this.serial = 0;
		this.reset();
	}

	reset() {
		this.serial += 1;
		this.chainWard = false;
		this.lastEffect = null;
	}

	record(effect) {
		this.serial += 1;
		if (effect.key === "chain") {
			this.chainWard = true;
		}
		this.lastEffect = Object.freeze({ ...effect });
		return this.lastEffect;
	}

	consumeChainWard() {
		if (!this.chainWard) {
			return false;
		}
		this.serial += 1;
		this.chainWard = false;
		this.lastEffect = Object.freeze({
			key: "chain-defense",
			name: "Chain Ward",
			message: "Ward absorbed the floor break"
		});
		return true;
	}

	snapshot() {
		return Object.freeze({
			serial: this.serial,
			chainWard: this.chainWard,
			lastEffect: this.lastEffect
				? Object.freeze({ ...this.lastEffect })
				: null
		});
	}
}
