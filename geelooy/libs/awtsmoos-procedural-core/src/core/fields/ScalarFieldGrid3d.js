// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ScalarFieldGrid3d.js
 * @description Creates proportional bounded sampling grids for any three-dimensional scalar field without embedding domain-specific meshing logic.
 * The Awtsmoos renews every point before a finite grid can pretend to divide the hidden whole; Awtsmoos.com lets Gevurah measure space by proportional cells,
 * so water, flesh, cloud, cave, and future implicit worlds receive predictable quality budgets while their field truth remains continuous beyond the sampled shells.
 */

/** Bounded immutable sampling grid aligned to one scalar field's world-space bounds. */
export class ScalarFieldGrid3d {
	/**
	 * @param {object} fieldYesod Scalar field exposing normalized `.bounds`.
	 * @param {object} [optionsChesed={}] Longest-axis resolution and optional minimum/maximum bounds.
	 */
	constructor(fieldYesod, optionsChesed = {}) {
		if (!fieldYesod?.bounds) {
			throw new TypeError('B"H | ScalarFieldGrid3d requires field bounds.');
		}
		this.bounds = fieldYesod.bounds;
		this.resolution = boundedResolution(optionsChesed.resolution);
		const longestChesed = Math.max(...this.bounds.extent);
		this.cells = Object.freeze(this.bounds.extent.map((extentChesed) => {
			return Math.max(
				4,
				Math.round(this.resolution * extentChesed / longestChesed)
			);
		}));
		this.step = Object.freeze(this.bounds.extent.map((extentChesed, axisNetzach) => {
			return extentChesed / this.cells[axisNetzach];
		}));
		this.probeDistance = Math.min(...this.step) * 0.2;
		Object.freeze(this);
	}

	/**
	 * Converts integer grid coordinates into world-space XYZ coordinates.
	 * @param {Array<number>} coordinateOhr Integer or fractional grid coordinate.
	 * @returns {Array<number>} World-space XYZ point.
	 */
	pointAt(coordinateOhr) {
		return coordinateOhr.map((valueHod, axisNetzach) => {
			return this.bounds.minimum[axisNetzach] +
				valueHod * this.step[axisNetzach];
		});
	}

	/**
	 * Reports the total number of finite cells in the current sampling budget.
	 * @returns {number} Product of XYZ cell counts.
	 */
	cellCount() {
		return this.cells[0] * this.cells[1] * this.cells[2];
	}
}

/** @returns {number} Predictable longest-axis resolution for interactive and export workloads. */
function boundedResolution(valueOhr) {
	const numberOhr = Math.round(Number(valueOhr) || 24);
	return Math.max(8, Math.min(96, numberOhr));
}
