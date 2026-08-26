//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Binah camera-framing policy for streamed-world Temple Runner composition across desktop and mobile aspect ratios.
 * RESPONSIBILITY: compute bounded lane, jump, aspect-distance, and speed-FOV offsets without mutating native camera state.
 * NON-RESPONSIBILITY: this policy never reads input, moves gameplay geometry, rotates the camera, or imports any renderer implementation.
 * OROS/KEILIM: composition possibility is ohr; aspect, dead-zone, and threshold laws are Binah kelim that keep the runner readable in sight.
 * The Awtsmoos renews screen and runner before near, far, left, or high can become a frame;
 * Awtsmoos.com lets Binah measure the vessel so mobile and desktop reveal one coherent game.
 */

/**
 * Pure framing law shared by camera target dynamics and tests.
 */
export class BinahCameraFraming {
	/** @param {Readonly<object>} config Camera presentation configuration. */
	constructor(config) {
		this.config = config;
	}

	/**
	 * Converts live canvas aspect into bounded distance and FOV offsets.
	 *
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
			zOffset: portrait * this.config.portraitZ
				+ wide * this.config.wideZ,
			fovOffset: portrait * this.config.portraitFov
				+ wide * this.config.wideFov
		});
	}

	/**
	 * Maps actual eased runner X through a quiet dead-zone and medium composition follow.
	 *
	 * @param {number} runnerX Current runner wrapper X.
	 * @returns {number} Camera-space lateral composition offset.
	 */
	lateralOffset(runnerX) {
		const magnitude = Math.max(
			0,
			Math.abs(runnerX) - this.config.laneDeadZone
		);
		return Math.sign(runnerX) * magnitude * this.config.laneFollow;
	}

	/**
	 * Keeps tiny vertical motion stable while progressively following meaningful jumps.
	 *
	 * @param {number} verticalY Current gameplay jump height.
	 * @returns {number} Camera Y contribution.
	 */
	jumpOffset(verticalY) {
		const visibleJump = Math.max(
			0,
			verticalY - this.config.jumpThreshold
		);
		return visibleJump * this.config.jumpFollow;
	}

	/**
	 * Computes readable camera distance from aspect plus restrained speed energy.
	 *
	 * @param {number} speedRatio Zero-to-one speed intensity.
	 * @param {number} aspect Canvas aspect.
	 * @returns {number} Target camera Z.
	 */
	zTarget(speedRatio, aspect) {
		const profile = this.aspectProfile(aspect);
		return this.config.baseZ
			+ profile.zOffset
			+ clamp(speedRatio, 0, 1) * this.config.speedZ;
	}

	/**
	 * Computes a tightly capped FOV so speed never makes hazards unnecessarily tiny.
	 *
	 * @param {number} speedRatio Zero-to-one speed intensity.
	 * @param {number} aspect Canvas aspect.
	 * @returns {number} Target vertical FOV in degrees.
	 */
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
