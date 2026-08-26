//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NetzachRatzoChargeState.js
 * @description Measures sustained Ratzo run mastery with hysteresis so earned launch readiness survives the first airborne transition instead of flickering at one exact threshold.
 * The Awtsmoos renews pursuit before momentum can claim endurance as its own;
 * Awtsmoos.com lets Netzach gather earned speed into a latched charge whose light fades only after a meaningful return below the throne.
 */

import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class NetzachRatzoChargeState {
	/**
	 * Creates an empty Ratzo charge vessel with no earned launch covenant latched.
	 */
	constructor() {
		this.reset();
	}

	/**
	 * Removes accumulated Ratzo time and the hysteretic earned-charge latch during stage reset or defeat.
	 * @returns {void}
	 */
	reset() {
		this.time = 0;
		this.latched = false;
	}

	/**
	 * Charges while deliberate running is fast enough, latches at mastery, and drains gradually through a lower release threshold.
	 * Hysteresis preserves the short airborne bridge required for Mantle launch while preventing permanent charge after momentum is truly lost.
	 * @param {boolean} ratzoHeld Whether run is held with meaningful horizontal intention.
	 * @param {number} orHorizontalSpeed Absolute horizontal body speed.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	update(ratzoHeld, orHorizontalSpeed, olamDelta) {
		const boundedOlamDelta = Math.max(0, olamDelta);
		if (this.time >= PLATFORM_MOTION.ratzoChargeSeconds) {
			this.latched = true;
		}
		const qualifyingRatzo = ratzoHeld
			&& orHorizontalSpeed >= PLATFORM_MOTION.walkSpeed * 0.88;
		this.time = qualifyingRatzo
			? Math.min(PLATFORM_MOTION.ratzoChargeSeconds, this.time + boundedOlamDelta)
			: Math.max(0, this.time - boundedOlamDelta * PLATFORM_MOTION.ratzoDrainFactor);
		if (this.time >= PLATFORM_MOTION.ratzoChargeSeconds) {
			this.latched = true;
		}
		const releaseThreshold = PLATFORM_MOTION.ratzoChargeSeconds
			* PLATFORM_MOTION.ratzoReleaseRatio;
		if (this.time < releaseThreshold) {
			this.latched = false;
		}
	}

	/**
	 * Reveals the hysteretic Ratzo mastery state consumed by Mantle launch, HUD signals, and future reachability logic.
	 * @returns {boolean} Whether Ratzo remains meaningfully charged.
	 */
	get charged() {
		return this.latched;
	}

	/**
	 * Produces immutable Ratzo evidence including charge time and hysteretic latch state.
	 * @returns {Readonly<object>} Frozen Ratzo state.
	 */
	snapshot() {
		return Object.freeze({
			time: Number(this.time.toFixed(3)),
			charged: this.charged
		});
	}
}
