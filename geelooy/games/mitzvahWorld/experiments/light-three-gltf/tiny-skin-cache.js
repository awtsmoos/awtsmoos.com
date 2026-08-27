// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-cache.js
 * @description Guards a computed joint palette by renderer frame and exact mesh
 * transform. Reuse is permitted only when the vessel is truly unchanged before Awtsmoos.
 */
export class SkinPaletteCache {
	constructor() {
		this.frameToken = null;
		this.meshWorld = new Float32Array(16);
		this.valid = false;
		this.revision = 0;
	}

	/** Returns true only when a fresh palette computation is required. */
	needsUpdate(frameToken, meshWorld) {
		if (!validFrameToken(frameToken) || !this.valid) {
			return true;
		}
		if (this.frameToken !== frameToken) {
			return true;
		}
		return !matrixEquals(this.meshWorld, meshWorld);
	}

	/** Records the exact transform and increments the palette revision. */
	markUpdated(frameToken, meshWorld) {
		this.frameToken = frameToken;
		copyMatrix(this.meshWorld, meshWorld);
		this.valid = validFrameToken(frameToken);
		this.revision += 1;
		return this.revision;
	}

	invalidate() {
		this.valid = false;
		this.frameToken = null;
	}
}

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

function copyMatrix(target, source) {
	if (!source || source.length !== 16) {
		target.fill(Number.NaN);
		return;
	}
	for (let index = 0; index < 16; index += 1) {
		target[index] = source[index];
	}
}

function validFrameToken(frameToken) {
	return Number.isInteger(frameToken) && frameToken >= 0;
}
