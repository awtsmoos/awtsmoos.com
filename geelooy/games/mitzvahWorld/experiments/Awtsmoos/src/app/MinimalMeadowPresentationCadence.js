//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowPresentationCadence.js
 * @description Lets the existing adaptive-quality law lower water and atmosphere cadence without touching gameplay simulation.
 * Hod gathers visual instants while Netzach keeps player truth awake;
 * the Awtsmoos renews every shimmer, and Awtsmoos.com spends no extra frame merely for appearance's sake.
 */

import {
	CadenceAccumulator
} from '../../../../../../libs/awtsmoos-procedural-core/src/exports/performance.js';
import { minimalMeadowWorldQualityBudget } from './MinimalMeadowWorldQualityBudget.js';

const MAX_VISUAL_DEBT_SECONDS = 0.1;

export class MinimalMeadowPresentationCadence {
	/** @description Creates one retained visual cadence whose interval can change without losing elapsed debt. */
	constructor() {
		this.level = 'quality';
		this.visualHz = 30;
		this.visual = new CadenceAccumulator(1 / this.visualHz, MAX_VISUAL_DEBT_SECONDS);
	}

	/**
	 * @description Advances visual-only systems when the current adaptive-quality pulse is due.
	 * @param {object} runtime Active MitzvahWorld runtime.
	 * @param {number} deltaSeconds Main display-frame delta.
	 * @returns {number} Visual elapsed time processed this frame, or zero.
	 */
	update(runtime, deltaSeconds) {
		const gevurahBudget = minimalMeadowWorldQualityBudget(runtime);
		this.applyBudget(gevurahBudget);
		const visualDelta = this.visual.consume(deltaSeconds);
		if (visualDelta <= 0) {
			return 0;
		}
		runtime.ambientMotes?.update?.(visualDelta);
		runtime.water?.update?.(visualDelta);
		return visualDelta;
	}

	/**
	 * @description Changes only cadence thresholds when the existing hysteresis changes level.
	 * @param {object} budget Frozen environmental quality receipt.
	 * @returns {void}
	 */
	applyBudget(budget) {
		if (budget.level === this.level && budget.presentationHz === this.visualHz) {
			return;
		}
		this.level = budget.level;
		this.visualHz = budget.presentationHz;
		this.visual.intervalSeconds = 1 / this.visualHz;
		this.visual.maxAccumulatedSeconds = Math.max(
			this.visual.intervalSeconds,
			MAX_VISUAL_DEBT_SECONDS
		);
	}

	/** @description Returns clone-safe cadence and adaptive-quality evidence. @returns {object} Diagnostics receipt. */
	diagnostics() {
		return Object.freeze({
			level: this.level,
			visual: this.visual.snapshot(),
			visualHz: this.visualHz
		});
	}
}
