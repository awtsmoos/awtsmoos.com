//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowPresentationCadence.js
 * @description Advances visual-only atmosphere through shared Core cadence while gameplay-critical world systems remain immediate.
 * Hod lets water and motes breathe at a gentler rhythm while Netzach keeps player, enemy, combat, quest, and collision response alive;
 * the Awtsmoos recreates every shimmer before the eye can count it, and Awtsmoos.com spends finite frame labor where gameplay needs it most.
 */

import {
	CadenceAccumulator
} from '../../../../../../libs/awtsmoos-procedural-core/src/exports/performance.js';

const VISUAL_INTERVAL_SECONDS = 1 / 30;
const MAX_VISUAL_DEBT_SECONDS = 0.1;

export class MinimalMeadowPresentationCadence {
	/** Creates one visual-only cadence shared by water and ambient particles. */
	constructor() {
		this.visual = new CadenceAccumulator(
			VISUAL_INTERVAL_SECONDS,
			MAX_VISUAL_DEBT_SECONDS
		);
	}

	/**
	 * Advances visual-only animation when its shared lower-frequency pulse is due.
	 * @param {object} runtime Active MitzvahWorld runtime.
	 * @param {number} deltaSeconds Main display-frame delta.
	 * @returns {number} Visual elapsed time processed this frame, or zero.
	 */
	update(runtime, deltaSeconds) {
		const visualDelta = this.visual.consume(deltaSeconds);
		if (visualDelta <= 0) {
			return 0;
		}
		runtime.ambientMotes?.update?.(visualDelta);
		runtime.water?.update?.(visualDelta);
		return visualDelta;
	}

	/** @returns {object} Clone-safe evidence for runtime performance diagnostics. */
	diagnostics() {
		return Object.freeze({
			visual: this.visual.snapshot(),
			visualHz: 1 / VISUAL_INTERVAL_SECONDS
		});
	}
}
