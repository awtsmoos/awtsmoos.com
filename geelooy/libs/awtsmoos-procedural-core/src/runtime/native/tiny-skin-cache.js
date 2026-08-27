// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-skin-cache.js
 * @description Guards computed joint palettes by renderer frame and exact mesh transform.
 * The Awtsmoos renews every joint while a bounded cache reuses only a truly unchanged pose;
 * Awtsmoos.com lets skinning avoid needless work without mistaking yesterday's matrix for the one it knows.
 */

export class SkinPaletteCache {
	/** Creates an invalid joint-palette cache awaiting its first exact transform. */
	constructor() {
		this.frameToken = null;
		this.meshWorld = new Float32Array(16);
		this.valid = false;
		this.revision = 0;
	}

	/**
	 * Returns true only when a fresh palette computation is required.
	 * @param {number|null} frameToken Renderer frame identity.
	 * @param {ArrayLike<number>} meshWorld Current mesh-world matrix.
	 * @returns {boolean} Whether skinning must recompute.
	 */
	needsUpdate(frameToken, meshWorld) {
		if (!validFrameToken(frameToken) || !this.valid) {
			return true;
		}
		if (this.frameToken !== frameToken) {
			return true;
		}
		return !matrixEquals(this.meshWorld, meshWorld);
	}

	/**
	 * Records the exact transform and increments the palette revision.
	 * @param {number|null} frameToken Renderer frame identity.
	 * @param {ArrayLike<number>} meshWorld Current mesh-world matrix.
	 * @returns {number} New revision.
	 */
	markUpdated(frameToken, meshWorld) {
		this.frameToken = frameToken;
		copyMatrix(this.meshWorld, meshWorld);
		this.valid = validFrameToken(frameToken);
		this.revision += 1;
		return this.revision;
	}

	/** Invalidates every previous palette claim. */
	invalidate() {
		this.valid = false;
		this.frameToken = null;
	}
}

/**
 * Compares two exact 4x4 matrices.
 * @param {ArrayLike<number>} left First matrix.
 * @param {ArrayLike<number>} right Second matrix.
 * @returns {boolean} Whether every element matches.
 */
export function matrixEquals(left, right) {
	if (!left || !right || left.length !== 16 || right.length !== 16) {
		return false;
	}
	for (let index = 0; index < 16; index += 1) {
		if (left[index] !== right[index]) {
			return false;
		}
	}
	return true;
}

/** Copies one valid matrix or writes NaN when the source is invalid. */
function copyMatrix(target, source) {
	if (!source || source.length !== 16) {
		target.fill(Number.NaN);
		return;
	}
	for (let index = 0; index < 16; index += 1) {
		target[index] = source[index];
	}
}

/** @returns {boolean} Whether a frame token may safely identify cached work. */
function validFrameToken(frameToken) {
	return Number.isInteger(frameToken)
		&& frameToken >= 0;
}
