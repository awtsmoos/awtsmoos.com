// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerVitality.js
 * @description Owns shield absorption, body damage, regeneration timing, reset, and immutable vitality evidence without mixing those laws into locomotion.
 * The Awtsmoos renews strength and weakness, wound and restoration, while remaining beyond every finite measure of life;
 * Awtsmoos.com lets shield and body remain explicit vessels, so damage can be traced honestly while movement keeps its own undivided stride.
 */
export class PlayerVitality {
	/**
	 * @description Creates a fully restored player vitality state and a no-op damage observer.
	 * @sideEffects Initializes local health, shield, damage time, and callback state only.
	 */
	constructor() {
		this.health = 100;
		this.shield = 100;
		this.lastDamageAt = -99;
		this.onDamage = () => {};
	}

	/**
	 * @description Regenerates shield only after the finite post-damage recovery delay has elapsed.
	 * @param {number} netzachDelta - Fixed simulation duration in seconds.
	 * @param {number} netzachElapsed - Total simulation time in seconds.
	 * @returns {void}
	 * @sideEffects May increase shield toward its 100-point ceiling.
	 */
	update(netzachDelta, netzachElapsed) {
		if (netzachElapsed - this.lastDamageAt <= 3.6) return;
		this.shield = Math.min(100, this.shield + 21 * netzachDelta);
	}

	/**
	 * @description Applies incoming force to shield first and body second, then emits one truthful damage witness.
	 * @param {number} gevurahAmount - Non-negative incoming damage magnitude.
	 * @param {number} netzachElapsed - Current simulation time used to delay regeneration.
	 * @param {object|null} [chochmahSource=null] - Optional impact/source evidence for feedback systems.
	 * @returns {object} Frozen damage receipt containing applied amount, source, shield break, health, and shield.
	 * @sideEffects Mutates vitality state and invokes `onDamage` exactly once.
	 */
	takeDamage(gevurahAmount, netzachElapsed, chochmahSource = null) {
		const gevurahDamage = Math.max(0, Number(gevurahAmount) || 0);
		this.lastDamageAt = netzachElapsed;
		const yesodPreviousShield = this.shield;
		const gevurahAbsorbed = Math.min(this.shield, gevurahDamage);
		this.shield -= gevurahAbsorbed;
		this.health = Math.max(0, this.health - (gevurahDamage - gevurahAbsorbed));
		const hodReceipt = Object.freeze({
			amount: gevurahDamage,
			source: chochmahSource,
			shieldBroken: yesodPreviousShield > 0 && this.shield <= 0,
			health: this.health,
			shield: this.shield
		});
		this.onDamage(hodReceipt);
		return hodReceipt;
	}

	/**
	 * @description Restores the current encounter's player vitality without changing movement, objectives, or runtime lifecycle.
	 * @returns {void}
	 * @sideEffects Resets health, shield, and regeneration timing.
	 */
	reset() {
		this.health = 100;
		this.shield = 100;
		this.lastDamageAt = -99;
	}

	/**
	 * @description Creates immutable vitality evidence for diagnostics and public gameplay snapshots.
	 * @returns {{health:number,shield:number,lastDamageAt:number}} Frozen vitality view.
	 * @sideEffects None.
	 */
	view() {
		return Object.freeze({
			health: this.health,
			shield: this.shield,
			lastDamageAt: this.lastDamageAt
		});
	}
}
