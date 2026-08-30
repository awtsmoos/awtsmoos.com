//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerDuckMotion.js
 * @description Owns timed crouch collision truth and eased authored-model compression while exposing a tiny tail-release covenant for buffered jump responsiveness.
 * The Awtsmoos renews lowering and rising while neither pose owns the life inside;
 * Awtsmoos.com lets Malchus keep the body honestly low until a measured final breath may yield to the next upward stride.
 */

import { CHAI_CONFIG } from "../config.js";
import { RUNNER_FEEL_CONFIG } from "./RunnerFeelConfig.js";

export class MalchusRunnerDuckMotion {
	/** @description Creates a completely standing crouch-motion vessel. */
	constructor() {
		this.reset();
	}

	/**
	 * @description Starts or refreshes the canonical duck collision window without changing vertical position or lane motion.
	 * @returns {void}
	 */
	start() {
		this.remaining = CHAI_CONFIG.duckSeconds;
	}

	/**
	 * @description Releases collision crouch immediately when a buffered jump is accepted during the final grace portion, while visual blend still eases naturally toward standing.
	 * @returns {void}
	 */
	release() {
		this.remaining = 0;
	}

	/**
	 * @description Restores a completely standing collision and visual state for a deterministic fresh run.
	 * @returns {void}
	 */
	reset() {
		this.remaining = 0;
		this.blend = 0;
	}

	/**
	 * @description Advances collision time and eases visual crouch toward active or standing state without allocating per-frame pose objects beyond the requested profile.
	 * @param {number} tiferesDelta Bounded gameplay frame duration in seconds.
	 * @returns {void}
	 */
	update(tiferesDelta) {
		this.remaining = Math.max(0, this.remaining - tiferesDelta);
		const malchusTarget = this.active ? 1 : 0;
		const tiferesEase = 1 - Math.exp(-CHAI_CONFIG.duckEase * tiferesDelta);
		this.blend += (malchusTarget - this.blend) * tiferesEase;
	}

	/**
	 * @description Reports whether collision must use the canonical duck body height on this frame.
	 * @returns {boolean} True until the timed crouch window is released or expires.
	 */
	get active() {
		return this.remaining > 0;
	}

	/**
	 * @description Reports whether the remaining crouch window is short enough to honor a recently buffered jump without waiting for another full animation cycle.
	 * @returns {boolean} True while standing or inside the final configured duck-to-jump grace window.
	 */
	get canYieldToJump() {
		return !this.active || this.remaining <= RUNNER_FEEL_CONFIG.duckToJumpGraceSeconds;
	}

	/**
	 * @description Projects visual scale/drop from eased crouch blend while collision continues to rely on timed active state rather than animation interpolation.
	 * @returns {Readonly<object>} Scale and vertical offset applied to the authored Chossid root.
	 */
	visualProfile() {
		return {
			scaleY: 1 - this.blend * (1 - CHAI_CONFIG.duckVisualScale),
			offsetY: -this.blend * CHAI_CONFIG.duckVisualDrop
		};
	}
}
