// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-system.js
 * @description Owns imported skin palettes and measured frame-local reuse. Every
 * matrix is a finite keli renewed by the Awtsmoos, and Awtsmoos.com reuses it only
 * when frame identity and mesh transform agree exactly.
 */
import { identity, inverse, multiply } from './tiny-math.js';
import { SkinPaletteCache } from './tiny-skin-cache.js';
import { skeletonLinePositions } from './tiny-skin-lines.js';
import { readSkinMatrix } from './tiny-skin-matrix.js';
import {
	bindSceneSkeletons,
	collectWorldMatrices,
	setMeshKindVisibility,
	updateTinySkeletons
} from './tiny-skin-scene.js';

export const MAX_TINY_JOINTS = 96;

export {
	collectWorldMatrices,
	setMeshKindVisibility,
	skeletonLinePositions,
	updateTinySkeletons
};

/** Stores one GLTF skin and computes its mesh-relative joint palette. */
export class TinySkeleton {
	constructor({
		skinIndex = 0,
		skinDef = {},
		nodeMap = new Map(),
		inverseBindAccessor = null
	} = {}) {
		this.skinIndex = skinIndex;
		this.name = skinDef.name || `Skin_${skinIndex}`;
		this.joints = (skinDef.joints || []).map((index) => nodeMap.get(index));
		this.inverseBindMatrices = this.joints.map((_, index) => (
			readSkinMatrix(inverseBindAccessor, index)
		));
		this.jointCount = this.joints.length;
		this.jointMatrices = new Float32Array(Math.max(1, this.jointCount) * 16);
		this.paletteCache = new SkinPaletteCache();
		this.paletteRevision = 0;
		this.lastPaletteRecomputed = false;
		this.resetPalette();
	}

	resetPalette() {
		for (let index = 0; index < Math.max(1, this.jointCount); index += 1) {
			this.jointMatrices.set(identity(), index * 16);
		}
	}

	update(meshWorld = identity()) {
		this.computePalette(meshWorld);
		this.paletteRevision += 1;
		this.paletteCache.invalidate();
		this.lastPaletteRecomputed = true;
		return Math.min(this.jointCount, MAX_TINY_JOINTS);
	}

	updateCached(meshWorld = identity(), frameToken) {
		if (!this.paletteCache.needsUpdate(frameToken, meshWorld)) {
			this.lastPaletteRecomputed = false;
			return Math.min(this.jointCount, MAX_TINY_JOINTS);
		}
		this.computePalette(meshWorld);
		this.paletteCache.markUpdated(frameToken, meshWorld);
		this.paletteRevision += 1;
		this.lastPaletteRecomputed = true;
		return Math.min(this.jointCount, MAX_TINY_JOINTS);
	}

	invalidatePaletteCache() {
		this.paletteCache.invalidate();
	}

	computePalette(meshWorld) {
		const inverseMesh = inverse(meshWorld);
		const count = Math.min(this.jointCount, MAX_TINY_JOINTS);
		for (let index = 0; index < count; index += 1) {
			const joint = this.joints[index];
			const jointWorld = joint?.userData?.worldMatrix
				|| joint?.matrixWorld
				|| identity();
			const skinMatrix = multiply(
				inverseMesh,
				multiply(jointWorld, this.inverseBindMatrices[index])
			);
			this.jointMatrices.set(skinMatrix, index * 16);
		}
	}
}

/** Builds and binds every GLTF skin using the canonical TinySkeleton class. */
export function bindTinySkeletons(root, doc, accessors) {
	return bindSceneSkeletons(
		root,
		doc,
		accessors,
		(configuration) => new TinySkeleton(configuration)
	);
}