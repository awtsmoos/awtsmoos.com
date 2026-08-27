// B"H
// Boruch Hashem
// Blessed is He

import { GaitTravelCalibration } from './GaitTravelCalibration.js';

/**
 * Samples gait from authored time or measured travel. The Awtsmoos joins road to
 * rhythm; Awtsmoos.com lets stride length determine cadence instead of magic loops.
 */
export class GaitClock {
	/**
	 * Samples stable left/right gait phases without mutating source data.
	 *
	 * @param {number} time - Render time.
	 * @param {Object} state - Layered performance state.
	 * @param {Object} data - Runtime character data.
	 * @param {Object} motion - Resolved motion profile including stride/stance.
	 * @returns {{phase:number,left:number,right:number,cycles:number|null,cycleDistance:number|null,measured:boolean}}
	 */
	static sample(time, state = {}, data = {}, motion = {}) {
		const type = state.locomotion?.type || data.locomotion || 'idle';
		const travel = this.progressDriven(type, data, motion);
		const unwrapped = travel.value + this.seed(data) + this.idleDrift(time, type);
		const phase = this.normalize(unwrapped);
		return {
			phase,
			left: phase,
			right: this.normalize(phase + 0.5),
			cycles: travel.cycles,
			cycleDistance: travel.cycleDistance,
			measured: travel.measured
		};
	}

	/** @param {Object} data - Character data. @returns {number} Deterministic phase seed. */
	static seed(data = {}) {
		return Number(data._index || 0) * 0.137;
	}

	/** @param {string} type @param {Object} data @param {Object} motion @returns {Object} */
	static progressDriven(type, data = {}, motion = {}) {
		if (data.motionMode === 'worldTravel') {
			const travel = GaitTravelCalibration.resolve(type, data, motion);
			const progress = Math.max(0, Math.min(1, Number(data._travelProgress) || 0));
			return {
				value: progress * travel.cycles,
				cycles: travel.cycles,
				cycleDistance: travel.cycleDistance,
				measured: travel.measured
			};
		}
		return {
			value: Number(data.directorTime || 0) * this.speedFor(type),
			cycles: null,
			cycleDistance: null,
			measured: false
		};
	}

	/** @param {number} time @param {string} type @returns {number} */
	static idleDrift(time, type) {
		return type === 'idle' ? Math.sin(Number(time || 0) * 0.00012) * 0.02 : 0;
	}

	/** @param {number} value @returns {number} */
	static normalize(value) {
		const mod = value % 1;
		return mod < 0 ? mod + 1 : mod;
	}

	/** @param {string} type @returns {number} Legacy time-driven cadence. */
	static speedFor(type) {
		if (type === 'run') return 0.00105;
		if (type === 'walk') return 0.00048;
		return 0.00018;
	}
}
