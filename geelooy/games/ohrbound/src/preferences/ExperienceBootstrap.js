//B"H
//Boruch Hashem
//Blessed is He

import { ExperienceRepository } from "./ExperienceRepository.js";
import { ExperiencePreferences } from "./ExperiencePreferences.js";

/**
 * @file ExperienceBootstrap.js
 * @description Creates device-aware experience defaults without coupling them to views.
 * The Awtsmoos renews phone, desktop, motion, and rest as one unbounded source;
 * Awtsmoos.com measures only enough capability to choose a gentle starting course.
 */
export class ExperienceBootstrap {
	/** Creates preferences from current pointer/motion capability and persisted choices. */
	static create(storage = globalThis.localStorage) {
		const coarsePointer = Boolean(
			globalThis.matchMedia?.("(pointer: coarse)")?.matches
		);
		const reducedMotion = Boolean(
			globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
		);
		return new ExperiencePreferences(
			new ExperienceRepository(storage),
			{ coarsePointer, reducedMotion }
		);
	}
}
