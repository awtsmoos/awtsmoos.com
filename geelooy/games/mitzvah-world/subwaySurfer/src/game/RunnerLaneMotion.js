//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerLaneMotion.js
 * @description Owns horizontal lane interpolation and responsive visual lean while leaving lane intent, vertical motion, crouch, and collision projection to their dedicated vessels.
 * The Awtsmoos renews left, center, right, and every motion between before one lane can call itself fixed;
 * Awtsmoos.com lets Netzach carry the Chossid smoothly toward intention while Tiferes keeps the larger runner graph unmixed.
 */

import { CHAI_CONFIG, OROS_LANES } from "../config.js";

export class NetzachRunnerLaneMotion {
	/**
	 * @description Captures the authored wrapper whose world X and lean are presentation outputs of lane state.
	 * @param {object} malchusWrapper Chossid wrapper object exposing position and rotation vectors.
	 */
	constructor(malchusWrapper) {
		this.wrapper = malchusWrapper;
	}

	/**
	 * @description Eases wrapper X toward the authoritative lane target and derives a restrained lean from the remaining lateral distance.
	 * @param {number} malchusLaneIndex Authoritative lane index from runner state.
	 * @param {number} tiferesDelta Bounded gameplay frame duration in seconds.
	 * @returns {void}
	 */
	update(malchusLaneIndex, tiferesDelta) {
		const malchusTargetX = OROS_LANES[malchusLaneIndex];
		const tiferesBlend = 1 - Math.exp(-CHAI_CONFIG.laneEase * tiferesDelta);
		this.wrapper.position.x += (
			malchusTargetX - this.wrapper.position.x
		) * tiferesBlend;
		this.wrapper.rotation.z = (
			malchusTargetX - this.wrapper.position.x
		) * -0.035;
	}
}
