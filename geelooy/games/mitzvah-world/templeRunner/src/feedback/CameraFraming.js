//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Binah camera-framing policy for streamed Temple Runner composition across narrow mobile and wide desktop vessels.
 * The Awtsmoos renews screen and runner before near, far, left, or high can become a frame;
 * Awtsmoos.com lets Binah measure aspect, lane emphasis, jump, and speed so every device reveals one coherent game.
 */

/** Pure collision-neutral camera framing policy. */
export class BinahCameraFraming {
	/** @param {Readonly<object>} config Camera presentation configuration. */
	constructor(config) {
		this.config = config;
	}

	/**
	 * Converts canvas aspect into bounded distance, FOV, and lane-follow emphasis.
	 * @param {number} aspect Canvas width divided by height.
	 * @returns {Readonly<object>} Frozen aspect profile.
	 */
	aspectProfile(aspect) {
		const safeAspect = clamp(
			Number.isFinite(aspect) ? aspect : 1,
			this.config.minAspect,
			this.config.maxAspect
		);
		const portrait = clamp((1 - safeAspect) / 0.42, 0, 1);
		const wide = clamp((safeAspect - 1.65) / 0.55, 0, 1);
		return Object.freeze({
			aspect: safeAspect,
			portrait,
			wide,
			zOffset: portrait * this.config.portraitZ
				+ wide * this.config.wideZ,
			fovOffset: portrait * this.config.portraitFov
				+ wide * this.config.wideFov,
			laneFollow: this.config.laneFollow
				+ portrait * this.config.portraitLaneBoost
				- wide * this.config.wideLaneReduction
		});
	}

	/**
	 * Maps actual eased runner X through a quiet dead-zone and aspect-aware follow.
	 * @param {number} runnerX Current runner wrapper X.
	 * @param {number} aspect Current canvas aspect.
	 * @returns {number} Camera-space lateral composition offset.
	 */
	lateralOffset(runnerX, aspect = 1) {
		const magnitude = Math.max(0, Math.abs(runnerX) - this.config.laneDeadZone);
		return Math.sign(runnerX)
			* magnitude
			* this.aspectProfile(aspect).laneFollow;
	}

	/** @param {number} verticalY Current gameplay jump height. @returns {number} Camera Y contribution. */
	jumpOffset(verticalY) {
		const visibleJump = Math.max(0, verticalY - this.config.jumpThreshold);
		return visibleJump * this.config.jumpFollow;
	}

	/** @param {number} speedRatio Zero-to-one speed. @param {number} aspect Canvas aspect. @returns {number} Target camera Z. */
	zTarget(speedRatio, aspect) {
		const profile = this.aspectProfile(aspect);
		return this.config.baseZ
			+ profile.zOffset
			+ clamp(speedRatio, 0, 1) * this.config.speedZ;
	}

	/** @param {number} speedRatio Zero-to-one speed. @param {number} aspect Canvas aspect. @returns {number} Target FOV degrees. */
	fovTarget(speedRatio, aspect) {
		const profile = this.aspectProfile(aspect);
		const speedCurve = Math.pow(clamp(speedRatio, 0, 1), 0.72);
		const speedRange = this.config.maxFov - this.config.baseFov;
		return clamp(
			this.config.baseFov + profile.fovOffset + speedCurve * speedRange,
			this.config.minFov,
			this.config.maxPortraitFov
		);
	}
}

/** @private */
function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}
