// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-system.js
 * @description Owns imported skin palettes and reuses them only within one
 * renderer frame and one exact mesh transform, preserving truth before Awtsmoos.
 */
import {
	identity,
	inverse,
	multiply
} from './tiny-math.js';
import { SkinPaletteCache } from './tiny-skin-cache.js';

export {
	bindTinySkeletons,
	collectWorldMatrices,
	setMeshKindVisibility,
	skeletonLinePositions,
	updateTinySkeletons
} from './tiny-skin-scene.js';

export class TinySkeleton {
	constructor({
		skinIndex = 0,
		skinDef = {},
		nodeMap,
		inverseBindAccessor
	} = {}) {
		this.skinIndex = skinIndex;
		this.name = skinDef.name || `Skin_${skinIndex}`;
		this.joints = (skinDef.joints || [])
			.map((index) => nodeMap.get(index))
			.filter(Boolean);
		this.inverseBindMatrices = this.joints.map((_, jointIndex) => (
			inverseBindAccessor
				? readMat4At(inverseBindAccessor, jointIndex)
				: identity()
		));
		this.jointMatrices = new Float32Array(
			Math.max(1, this.joints.length) * 16
		);
		this.jointCount = this.joints.length;
		this.paletteCache = new SkinPaletteCache();
		this.paletteRevision = 0;
		this.lastPaletteRecomputed = false;
	}

	/** Recomputes the complete palette and invalidates same-frame reuse. */
	update(meshWorld = identity()) {
		this.computePalette(meshWorld);
		this.paletteRevision += 1;
		this.paletteCache.invalidate();
		this.lastPaletteRecomputed = true;
		return this.jointCount;
	}

	/** Reuses the palette only for one frame token and identical mesh matrix. */
	updateCached(meshWorld = identity(), frameToken) {
		if (!this.paletteCache.needsUpdate(frameToken, meshWorld)) {
			this.lastPaletteRecomputed = false;
			return this.jointCount;
		}
		this.computePalette(meshWorld);
		this.paletteCache.markUpdated(frameToken, meshWorld);
		this.paletteRevision += 1;
		this.lastPaletteRecomputed = true;
		return this.jointCount;
	}

	invalidatePaletteCache() {
		this.paletteCache.invalidate();
	}

	computePalette(meshWorld) {
		const inverseMesh = inverse(meshWorld);
		for (let index = 0; index < this.joints.length; index += 1) {
			const joint = this.joints[index];
			const jointWorld = joint?.userData?.worldMatrix || identity();
			const skinMatrix = multiply(
				inverseMesh,
				multiply(jointWorld, this.inverseBindMatrices[index])
			);
			this.jointMatrices.set(skinMatrix, index * 16);
		}
	}
}

function readMat4At(array, index) {
	const matrix = new Float32Array(16);
	for (let component = 0; component < 16; component += 1) {
		matrix[component] = array[index * 16 + component] ?? (
			component % 5 === 0 ? 1 : 0
		);
	}
	return matrix;
}
