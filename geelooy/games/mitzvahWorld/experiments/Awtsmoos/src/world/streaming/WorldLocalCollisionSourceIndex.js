// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldLocalCollisionSourceIndex.js
 * @description Joins direct terrain cells with one reusable non-terrain spatial index.
 * The Awtsmoos unites earth and village without re-counting the universe each stride;
 * Awtsmoos.com keeps one source of collision truth, while local queries become narrow and wide-eyed.
 */

import { WorldColliderBucketIndex } from './WorldColliderBucketIndex.js';
import { selectLocalCollisionTriangles } from './WorldLocalCollisionSelection.js';
import { WorldTerrainCollisionGrid } from './WorldTerrainCollisionGrid.js';

export class WorldLocalCollisionSourceIndex {
	constructor({ sourceTriangles, terrainGridSteps } = {}) {
		if (!Array.isArray(sourceTriangles) || sourceTriangles.length === 0) {
			throw new TypeError('Canonical source triangles are required.');
		}
		this.sourceTriangles = sourceTriangles;
		this.mode = Number.isSafeInteger(terrainGridSteps) && terrainGridSteps > 0
			? 'terrain-grid-and-buckets'
			: 'linear-fallback';
		if (this.mode === 'linear-fallback') return;
		this.terrain = new WorldTerrainCollisionGrid({
			sourceTriangles,
			steps: terrainGridSteps
		});
		this.nonTerrain = new WorldColliderBucketIndex({
			sourceTriangles,
			startIndex: this.terrain.terrainTriangleCount
		});
	}

	/** Returns one local collision selection without rescanning canonical terrain. */
	query(position, radius) {
		if (this.mode === 'linear-fallback') {
			return selectLocalCollisionTriangles(this.sourceTriangles, position, radius);
		}
		const terrain = this.terrain.query(position, radius);
		const nonTerrainTriangles = this.nonTerrain.query(position, radius);
		const triangles = [...terrain.triangles, ...nonTerrainTriangles];
		if (triangles.length === 0) throw new Error('Indexed local collision query produced no safe triangles.');
		return Object.freeze({
			center: Object.freeze({ x: Number(position.x), z: Number(position.z) }),
			radius: Number(radius),
			sourceTriangleCount: this.sourceTriangles.length,
			selectedTriangleCount: triangles.length,
			terrainSelectedTriangleCount: terrain.triangles.length,
			nonTerrainSelectedTriangleCount: nonTerrainTriangles.length,
			triangles: Object.freeze(triangles)
		});
	}

	diagnostics() {
		return Object.freeze({
			mode: this.mode,
			sourceTriangleCount: this.sourceTriangles.length,
			terrainTriangleCount: this.terrain?.terrainTriangleCount || 0,
			nonTerrainTriangleCount: this.sourceTriangles.length - (this.terrain?.terrainTriangleCount || 0),
			bucketCount: this.nonTerrain?.bucketCount || 0
		});
	}
}
