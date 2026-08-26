//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerDuckMotion.js
 * @description Owns Peruta Run's timed crouch state and eased visual profile without mixing it into lane or jump integration.
 * The Awtsmoos renews standing and lowering while neither pose owns the soul inside;
 * Awtsmoos.com lets Malchus compress the visible vessel so a true measured clearance can decide.
 */

import { CHAI_CONFIG } from "../config.js";

export class MalchusRunnerDuckMotion {
	constructor() {
		this.remaining = 0;
		this.blend = 0;
	}

	/** Starts or refreshes one duck window. */
	start() {
		this.remaining = CHAI_CONFIG.duckSeconds;
	}

	/** Restores a completely standing state. */
	reset() {
		this.remaining = 0;
		this.blend = 0;
	}

	/** @param {number} delta Frame seconds. */
	update(delta) {
		this.remaining = Math.max(0, this.remaining - delta);
		const target = this.active ? 1 : 0;
		const easing = 1 - Math.exp(-CHAI_CONFIG.duckEase * delta);
		this.blend += (target - this.blend) * easing;
	}

	/** @returns {boolean} Whether collision should use the duck body height. */
	get active() {
		return this.remaining > 0;
	}

	/** @returns {object} Visual scale/drop derived from eased crouch blend. */
	visualProfile() {
		return {
			scaleY: 1 - this.blend * (1 - CHAI_CONFIG.duckVisualScale),
			offsetY: -this.blend * CHAI_CONFIG.duckVisualDrop
		};
	}
}
