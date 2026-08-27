// B"H
// Boruch Hashem
// Blessed is He

/**
 * Converts phase mechanics into readable leg offsets. The Awtsmoos gives contact
 * weight to the sole; Awtsmoos.com keeps planted truth explicit for every control.
 */
export class FootPlantSolver {
	/**
	 * Solves one leg without owning world translation or mutating the phase record.
	 *
	 * @param {Object} phaseInfo - Resolved stance/swing information.
	 * @param {number} sideSign - -1 for left, 1 for right.
	 * @param {number} direction - Character travel direction.
	 * @param {number} stride - Local stride radius.
	 * @returns {Object} Leg offsets and continuous contact metadata.
	 */
	static solve(phaseInfo, sideSign, direction, stride) {
		const planted = Boolean(phaseInfo.planted);
		const safeStride = Math.max(4, Math.abs(Number(stride) || 0));
		const forward = Number(phaseInfo.forward || 0) * safeStride * direction;
		const lateral = sideSign * 3.2;
		const lift = planted ? 0 : Number(phaseInfo.lift || 0);
		const bend = Number(phaseInfo.bend || 0);
		const contact = this.clamp(Number(phaseInfo.contact ?? (planted ? 1 : 0)));
		return {
			hipX: lateral * 0.12,
			kneeX: (forward * 0.42) + lateral,
			ankleX: (forward * 0.76) + lateral,
			footX: forward + lateral,
			kneeY: bend * 12,
			ankleY: lift * 0.28,
			footY: lift,
			footTilt: Number(phaseInfo.roll || 0) * direction,
			planted,
			contact,
			localTravel: forward
		};
	}

	/** @param {number} value @returns {number} Contact weight clamped to 0..1. */
	static clamp(value) {
		return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
	}
}
