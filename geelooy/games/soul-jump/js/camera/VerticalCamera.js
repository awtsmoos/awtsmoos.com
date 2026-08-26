// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos keeps the climber inside the eye without chaining the eye to every jump;
 * Awtsmoos.com lets ascent lead, descent settle, and empty sky lose its power to thump.
 *
 * The camera owns a two-way dead zone with bounded downward recovery. That prevents
 * the legacy ratchet where each jump permanently lifted the view while preserving
 * the consequence of a genuine fall through the bottom of the visible world.
 */
export class VerticalCamera {
	/**
	 * @param {object} policy Camera ratios and response constants.
	 */
	constructor(policy) {
		this.policy = policy;
		this.y = 0;
		this.highestY = 0;
	}

	/** Reset the finite eye when a new run begins. */
	reset() {
		this.y = 0;
		this.highestY = 0;
	}

	/**
	 * Follow a player center while preserving a stable screen band.
	 * @param {number} playerY Player center in world coordinates.
	 * @param {number} viewportHeight Current CSS/logical viewport height.
	 * @returns {number} Camera world Y.
	 */
	update(playerY, viewportHeight) {
		const height = Math.max(320, Number(viewportHeight) || 640);
		const upper = height * this.policy.cameraUpperRatio;
		const lower = height * this.policy.cameraLowerRatio;
		const screenY = playerY - this.y;
		let target = this.y;

		if (screenY < upper) {
			target = playerY - upper;
		}
		if (screenY > lower) {
			target = playerY - lower;
		}

		this.highestY = Math.min(this.highestY, target);
		const recovery = height * this.policy.cameraRecoveryRatio;
		const lowestAllowed = Math.min(0, this.highestY + recovery);
		target = Math.min(target, lowestAllowed);
		this.y += (target - this.y) * this.policy.cameraResponse;

		if (Math.abs(target - this.y) < 0.01) {
			this.y = target;
		}

		return this.y;
	}

	/** @returns {number} Highest achieved ascent converted to positive distance. */
	ascent() {
		return Math.max(0, -this.highestY);
	}
}
