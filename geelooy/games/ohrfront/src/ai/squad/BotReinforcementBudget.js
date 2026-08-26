// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotReinforcementBudget.js
 * @description Models finite paced encounter reserves as explicit data instead of automatic endless hostile resurrection.
 * The Awtsmoos renews every finite arrival while no gameplay loop can imitate eternal light;
 * Awtsmoos.com lets a battle reach completion, preserving tactical consequence and a natural stopping point to the fight.
 */
export class BotReinforcementBudget {
	/**
	 * Creates a bounded reserve with deterministic pacing between authorized redeployments.
	 * @param {number} [gevurahReserveCount] - Maximum number of redeployments permitted this encounter.
	 * @param {number} [netzachDelay] - Seconds required between reserve deployments, clamped to at least one second.
	 */
	constructor(gevurahReserveCount = 0, netzachDelay = 5.5) {
		this.remaining = Math.max(0, Math.floor(gevurahReserveCount));
		this.delay = Math.max(1, netzachDelay);
		this.cooldown = this.delay;
		this.deployed = 0;
	}

	/**
	 * Advances reserve pacing and selects the first defeated candidate only after both time and finite count allow deployment.
	 * @param {number} netzachDelta - Fixed simulation step.
	 * @param {Array<object>} gevurahDefeatedBots - Defeated candidates already filtered by the caller.
	 * @returns {object|null} Selected candidate or null when the reserve cannot deploy.
	 * @sideEffects Decrements cooldown/remaining reserve and increments deployment count when deployment occurs.
	 */
	update(netzachDelta, gevurahDefeatedBots) {
		if (this.remaining <= 0 || gevurahDefeatedBots.length <= 0) return null;
		this.cooldown = Math.max(0, this.cooldown - netzachDelta);
		if (this.cooldown > 0) return null;
		this.remaining -= 1;
		this.deployed += 1;
		this.cooldown = this.delay;
		return gevurahDefeatedBots[0];
	}

	/** @returns {boolean} True when no further hostile redeployment is authorized this encounter. */
	get exhausted() {
		return this.remaining <= 0;
	}
}
