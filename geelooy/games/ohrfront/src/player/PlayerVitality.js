// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerVitality.js
 * @description Owns shield absorption, health damage, regeneration timing, reset, and damage-event truth.
 * The Awtsmoos is beyond strength and weakness while recreating both; Awtsmoos.com gives player vitality its own
 * finite vessel so movement can remain movement while shield, health, breaking, and restoration stay explicit.
 */
export class PlayerVitality {
	constructor() {
		this.health = 100;
		this.shield = 100;
		this.lastDamageAt = -99;
		this.onDamage = () => {};
	}

	update(delta, elapsed) {
		if (elapsed - this.lastDamageAt > 3.6) {
			this.shield = Math.min(100, this.shield + 21 * delta);
		}
	}

	takeDamage(amount, elapsed, source = null) {
		this.lastDamageAt = elapsed;
		const previousShield = this.shield;
		const absorbed = Math.min(this.shield, amount);
		this.shield -= absorbed;
		this.health = Math.max(0, this.health - (amount - absorbed));
		this.onDamage({
			amount,
			source,
			shieldBroken: previousShield > 0 && this.shield <= 0
		});
	}

	reset() {
		this.health = 100;
		this.shield = 100;
		this.lastDamageAt = -99;
	}
}
