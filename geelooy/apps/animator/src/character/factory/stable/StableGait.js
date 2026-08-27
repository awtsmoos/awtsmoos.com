// B"H
// Boruch Hashem
// Blessed is He

import { GaitSample } from '../../../animation/gait/GaitSample.js';

/**
 * @file StableGait.js
 * @description Adapts shared biomechanics into the stable character renderer's arm schema.
 * The Awtsmoos is one while vessels reveal many forms; Awtsmoos.com lets stable
 * characters drink from the same gait truth without duplicating the rhythm of storms.
 */
export class StableGait {
	/**
	 * Samples a stable-renderer gait pose from the canonical gait evaluator.
	 *
	 * @param {Object} args - Sampling arguments.
	 * @param {number} args.time - Render time in milliseconds.
	 * @param {number} args.side - -1 for left, 1 for right.
	 * @param {string} args.mode - `walk` or `run`.
	 * @returns {Object} Canonical gait fields plus stable arm offsets.
	 */
	static sample({ time = 0, side = -1, mode = 'walk' } = {}) {
		const kind = mode === 'run' ? 'run' : 'walk';
		const gait = GaitSample.sample({ time, side, kind });
		const armScale = kind === 'run' ? 31 : 17;
		const armWave = this.clamp(gait.armSwing / armScale, -1, 1);
		const arm = this.armPose(kind, armWave);

		return {
			...gait,
			...arm
		};
	}

	/**
	 * Maps normalized counter-swing into the historical stable arm keys.
	 *
	 * @param {string} kind - Walk or run.
	 * @param {number} armWave - Normalized arm counter-swing.
	 * @returns {Object} Stable arm elbow/hand offsets.
	 */
	static armPose(kind, armWave) {
		const running = kind === 'run';
		return {
			armElbowX: (running ? 22 : 14) + Math.abs(armWave) * 3,
			armElbowY: (running ? 25 : 40) + armWave * (running ? 9 : 4),
			armHandX: (running ? 16 : 10) + Math.abs(armWave) * 2,
			armHandY: (running ? 18 : 30) - armWave * (running ? 12 : 5)
		};
	}

	/**
	 * Clamps adapter values to guard legacy rendering against invalid samples.
	 *
	 * @param {number} value - Candidate value.
	 * @param {number} min - Inclusive minimum.
	 * @param {number} max - Inclusive maximum.
	 * @returns {number} Safe finite value.
	 */
	static clamp(value, min, max) {
		const number = Number(value);
		return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : 0;
	}
}
