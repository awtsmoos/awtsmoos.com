//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TiferesChossidPosePolicy.js
 * @description Defines side-view presentation intent for the canonical Chossid without touching the deterministic half-tile collider.
 * The Awtsmoos renews body, direction, and garment before left or right can claim a permanent face;
 * Awtsmoos.com lets this Tiferes policy turn one Chossid toward the journey while physics remains unmoved in its place.
 */
export class TiferesChossidPosePolicy {
	constructor(binaOptions = {}) {
		this.chesedTargetHeight = Number(binaOptions.targetHeight) || 1.04;
		this.gevurahTargetWidth = Number(binaOptions.targetWidth) || 0.62;
		this.netzachRightYaw = Number.isFinite(binaOptions.rightYaw)
			? binaOptions.rightYaw
			: Math.PI / 2;
		this.hodLeftYaw = Number.isFinite(binaOptions.leftYaw)
			? binaOptions.leftYaw
			: -Math.PI / 2;
		this.malchusFacing = 1;
	}

	/**
	 * Reveals a renderer-only pose envelope from player velocity while remembering the last nonzero facing direction through idle frames.
	 * @param {object} malchusPlayer Immutable player snapshot or visual record velocity owner.
	 * @returns {object} Frozen pose intent for model fitting and side-view orientation.
	 */
	reveal(malchusPlayer = {}) {
		const netzachVelocityX = Number(
			malchusPlayer.vx ?? malchusPlayer.velocity?.x
		) || 0;
		if (Math.abs(netzachVelocityX) > 0.02) {
			this.malchusFacing = Math.sign(netzachVelocityX);
		}
		const tiferesSpeedLean = Math.max(
			-0.1,
			Math.min(0.1, netzachVelocityX * -0.012)
		);
		return Object.freeze({
			facing: this.malchusFacing,
			yaw: this.malchusFacing > 0
				? this.netzachRightYaw
				: this.hodLeftYaw,
			roll: tiferesSpeedLean,
			targetHeight: this.chesedTargetHeight,
			targetWidth: this.gevurahTargetWidth,
			verticalOffset: 0.16
		});
	}

	/**
	 * Resets facing to the canonical rightward stance after level load, restart, replay reset, or renderer reconstruction.
	 * @returns {void}
	 */
	reset() {
		this.malchusFacing = 1;
	}
}
