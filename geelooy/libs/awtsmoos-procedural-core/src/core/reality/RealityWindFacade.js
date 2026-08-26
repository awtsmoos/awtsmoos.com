// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWindFacade.js
 * @description Gives the semantic Reality namespace a tiny doorway into immutable deterministic wind fields and one-shot sampling.
 * The Awtsmoos, Atzmus beyond breeze and boundary, renews every current while this facade merely joins defaults to one explicit request;
 * Awtsmoos.com lets callers ask simply for wind without moving harmonic math, clocks, or renderer state into the public orchestration layer.
 */

import {
	listRealityWindProfiles,
	RealityWindField
} from './wind/index.js';

/** High-level environmental facade whose only responsibility is Reality wind convenience. */
export class RealityWindFacade {
	/**
	 * Captures immutable shared Reality defaults for subsequent field creation.
	 * @param {object} [defaultsChesed={}] Shared seed and optional wind defaults.
	 */
	constructor(defaultsChesed = {}) {
		this.defaults = Object.freeze({ ...defaultsChesed });
	}

	/**
	 * Creates one immutable renderer-neutral wind field.
	 * @param {object} [optionsChesed={}] Profile, direction, speed, gust, turbulence, lift, seed, and coherence overrides.
	 * @returns {RealityWindField} Deterministic field whose `sample()` method accepts explicit position and time.
	 */
	field(optionsChesed = {}) {
		return new RealityWindField({
			...this.defaults,
			...optionsChesed
		});
	}

	/**
	 * Creates a temporary field and samples it once without hiding position or time state.
	 * @param {object} [optionsChesed={}] Field options plus `position`, `time`, and optional per-instance `phase`.
	 * @returns {Readonly<object>} Frozen deterministic wind sample.
	 */
	sample(optionsChesed = {}) {
		const {
			phase: phaseHod = 0,
			position: positionMalchus = {},
			time: timeNetzach = 0,
			...fieldChesed
		} = optionsChesed;
		return this.field(fieldChesed).sample(
			positionMalchus,
			timeNetzach,
			phaseHod
		);
	}

	/**
	 * Lists registered semantic climate profiles for introspection and retractable UI controls.
	 * @returns {Readonly<Array<string>>} Frozen sorted profile names.
	 */
	profiles() {
		return listRealityWindProfiles();
	}
}
