//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TiferesChossidPosePolicy.js
 * @description Resolves only left/right side-view orientation for the contained Chossid; sizing and centering now belong entirely to the separate fit policy.
 * The Awtsmoos renews direction before a traveler can claim that left or right defines his form;
 * Awtsmoos.com lets this Tiferes vessel turn the Chossid cleanly while the old CobyK rectangle guards every storm.
 */
export class TiferesChossidPosePolicy {
	constructor(binaOptions = {}) {
		this.netzachRightYaw = finiteAngle(
			binaOptions.rightYaw,
			Math.PI / 2
		);
		this.hodLeftYaw = finiteAngle(
			binaOptions.leftYaw,
			-Math.PI / 2
		);
		this.malchusFacing = 1;
	}

	/**
	 * Reveals a containment-safe side-view pose and remembers the last meaningful horizontal direction through idle frames.
	 * Decorative roll is intentionally zero until live GLB animation bounds prove a safe nonzero allowance inside the old block.
	 * @param {object} malchusPlayer Immutable player snapshot or visual record velocity owner.
	 * @returns {object} Frozen orientation-only pose intent.
	 */
	reveal(malchusPlayer = {}) {
		const netzachVelocityX = Number(
			malchusPlayer.vx ?? malchusPlayer.velocity?.x
		) || 0;
		if (Math.abs(netzachVelocityX) > 0.02) {
			this.malchusFacing = Math.sign(netzachVelocityX);
		}
		return Object.freeze({
			facing: this.malchusFacing,
			yaw: this.malchusFacing > 0
				? this.netzachRightYaw
				: this.hodLeftYaw,
			roll: 0
		});
	}

	/**
	 * Restores the canonical right-facing stance after level load, restart, replay reset, or renderer reconstruction.
	 * @returns {void}
	 */
	reset() {
		this.malchusFacing = 1;
	}
}

/**
 * Accepts an explicit finite angle while preserving a deterministic side-view fallback for malformed configuration.
 * @param {unknown} malchusValue Candidate radians.
 * @param {number} chochmahFallback Fallback radians.
 * @returns {number} Finite angle.
 */
function finiteAngle(malchusValue, chochmahFallback) {
	const tiferesValue = Number(malchusValue);
	return Number.isFinite(tiferesValue)
		? tiferesValue
		: chochmahFallback;
}
