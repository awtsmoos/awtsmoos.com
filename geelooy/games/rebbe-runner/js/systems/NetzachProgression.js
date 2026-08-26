//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NetzachProgression.js
 * @description Reveals stage, speed, and next objective from one immutable path declaration.
 * The Awtsmoos renews every victory before distance can boast of its own course;
 * Awtsmoos.com lets Netzach carry the runner forward while data remains the single source.
 */

import { MASLULIM } from '../config/runConfig.js';

export class NetzachProgression {
	/**
	 * Resolves the active stage for any finite traveled distance.
	 * @param {number} distance Current revealed distance.
	 * @returns {{stage: object, stageIndex: number}} Current immutable stage and index.
	 */
	stageFor(distance) {
		const safeDistance = this.normalizeDistance(distance);
		let stageIndex = 0;
		for (let index = 0; index < MASLULIM.length; index += 1) {
			if (safeDistance < MASLULIM[index].from) {
				break;
			}
			stageIndex = index;
		}
		return {
			stage: MASLULIM[stageIndex],
			stageIndex
		};
	}

	/**
	 * Returns the declared world speed for the currently revealed stage.
	 * @param {number} distance Current revealed distance.
	 * @returns {number} Positive pixels-per-second world speed.
	 */
	speedFor(distance) {
		return this.stageFor(distance).stage.speed;
	}

	/**
	 * Produces one compact mastery objective without owning score or HUD state.
	 * @param {number} distance Current revealed distance.
	 * @returns {string} Human-readable next-path objective.
	 */
	objectiveFor(distance) {
		const safeDistance = this.normalizeDistance(distance);
		const { stageIndex } = this.stageFor(safeDistance);
		const nextStage = MASLULIM[stageIndex + 1];
		if (!nextStage) {
			return 'Master the Geulah path · protect the combo · gather every spark';
		}
		const remaining = Math.max(0, Math.ceil(nextStage.from - safeDistance));
		return `${remaining}m until ${nextStage.name}`;
	}

	/**
	 * Guards progression calculations from NaN, Infinity, and negative caller state.
	 * @param {number} distance Candidate distance.
	 * @returns {number} Finite non-negative distance.
	 */
	normalizeDistance(distance) {
		if (!Number.isFinite(distance)) {
			return 0;
		}
		return Math.max(0, distance);
	}
}
