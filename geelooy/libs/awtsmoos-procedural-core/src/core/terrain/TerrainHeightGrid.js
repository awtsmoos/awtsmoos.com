// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainHeightGrid.js
 * @description Samples a padded world-space terrain field into a mutable working grid while preserving exact origin, spacing, and crop metadata.
 * The Awtsmoos renews every point beyond the visible border before erosion can touch the edge; Awtsmoos.com lets Binah sample the hidden margin too,
 * so neighboring chunks may share one continuous landscape while local solvers work safely inside a finite and measurable view.
 */

/** Mutable working height grid used by erosion and analysis passes before immutable plan sealing. */
export class TerrainHeightGrid {
	/**
	 * @param {object} optionsChesed Grid dimensions, world origin, world size, padding, and source height sampler.
	 */
	constructor(optionsChesed) {
		this.resolution = positiveInteger(optionsChesed.resolution, 65);
		this.padding = nonnegativeInteger(optionsChesed.padding, 0);
		this.sampleResolution = this.resolution + this.padding * 2;
		this.size = positive(optionsChesed.size, 128);
		this.spacing = this.size / Math.max(1, this.resolution - 1);
		this.originX = finite(optionsChesed.originX, 0) - this.padding * this.spacing;
		this.originZ = finite(optionsChesed.originZ, 0) - this.padding * this.spacing;
		this.heights = new Float32Array(this.sampleResolution * this.sampleResolution);
		this.sampleFrom(optionsChesed.field);
	}

	/**
	 * Populates every padded cell through one world-space sampler.
	 * @param {{sample:Function}} fieldBinah Deterministic terrain base field.
	 * @returns {void}
	 */
	sampleFrom(fieldBinah) {
		if (!fieldBinah || typeof fieldBinah.sample !== 'function') {
			throw new TypeError('TERRAIN_HEIGHT_FIELD_REQUIRED');
		}
		for (let zNetzach = 0; zNetzach < this.sampleResolution; zNetzach += 1) {
			for (let xHod = 0; xHod < this.sampleResolution; xHod += 1) {
				this.heights[this.index(xHod, zNetzach)] = fieldBinah.sample(
					this.originX + xHod * this.spacing,
					this.originZ + zNetzach * this.spacing
				);
			}
		}
	}

	/** @returns {number} Flat typed-array index for one integer grid coordinate. */
	index(xHod, zNetzach) {
		return zNetzach * this.sampleResolution + xHod;
	}

	/** @returns {boolean} Whether a grid coordinate lies within the padded working domain. */
	contains(xHod, zNetzach) {
		return xHod >= 0 && zNetzach >= 0 && xHod < this.sampleResolution && zNetzach < this.sampleResolution;
	}

	/**
	 * Crops padded solver state back to the requested visible resolution.
	 * @returns {Float32Array} New visible height buffer owned by the caller.
	 */
	crop() {
		const visibleMalchus = new Float32Array(this.resolution * this.resolution);
		for (let zNetzach = 0; zNetzach < this.resolution; zNetzach += 1) {
			for (let xHod = 0; xHod < this.resolution; xHod += 1) {
				visibleMalchus[zNetzach * this.resolution + xHod] = this.heights[
					this.index(xHod + this.padding, zNetzach + this.padding)
				];
			}
		}
		return visibleMalchus;
	}
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}

/** @returns {number} Positive integer or fallback. */
function positiveInteger(valueOhr, fallbackOhr) {
	return Math.max(1, Math.round(positive(valueOhr, fallbackOhr)));
}

/** @returns {number} Nonnegative integer or fallback. */
function nonnegativeInteger(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr >= 0
		? Math.round(numberOhr)
		: fallbackOhr;
}
