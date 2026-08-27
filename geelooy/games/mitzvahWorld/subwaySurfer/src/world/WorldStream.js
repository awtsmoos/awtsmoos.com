// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the horizon while yesterday's chunk becomes tomorrow's road;
 * Awtsmoos.com keeps the stream finite in memory while wonder stays unbowed.
 */

import { OLAM_CONFIG } from "../config.js";
import { TiferesWorldChunk } from "./WorldChunk.js";

export class YesodWorldStream {
	/** @param {object} dependencies Scene, Three.js, and all world factories. */
	constructor(dependencies) {
		this.THREE = dependencies.THREE;
		this.scene = dependencies.scene;
		this.dependencies = dependencies;
		this.root = new this.THREE.Group();
		this.root.name = "EndlessProceduralWorld";
		this.chunks = [];
		this.nextPatternIndex = 0;
	}

	/** Creates the bounded chunk pool and attaches it to the scene. @returns {YesodWorldStream} This stream. */
	create() {
		this.scene.add(this.root);
		for (let index = 0; index < OLAM_CONFIG.chunkCount; index += 1) {
			const chunk = new TiferesWorldChunk({ ...this.dependencies, index });
			this.root.add(chunk.root);
			this.chunks.push(chunk);
		}
		this.reset();
		return this;
	}

	/** Returns all chunks to their initial deterministic arrangement. */
	reset() {
		this.nextPatternIndex = OLAM_CONFIG.chunkCount;
		this.chunks.forEach((chunk, index) => {
			const z = OLAM_CONFIG.firstChunkZ - index * OLAM_CONFIG.chunkLength;
			chunk.reset(z, index);
		});
	}

	/** @param {number} delta Frame seconds. @param {number} speed Forward stream speed. @param {number} time Visual time. */
	update(delta, speed, time) {
		for (const chunk of this.chunks) {
			chunk.root.position.z += speed * delta;
			chunk.animate(time);
			if (chunk.root.position.z > OLAM_CONFIG.recycleZ) {
				this.recycle(chunk);
			}
		}
	}

	/** @param {TiferesWorldChunk} chunk Chunk that crossed the recycle plane. */
	recycle(chunk) {
		let farthestZ = Infinity;
		for (const candidate of this.chunks) {
			if (candidate !== chunk) {
				farthestZ = Math.min(farthestZ, candidate.root.position.z);
			}
		}
		chunk.reset(farthestZ - OLAM_CONFIG.chunkLength, this.nextPatternIndex);
		this.nextPatternIndex += 1;
	}

	/** @param {Function} callback Receives collectible slot and owning chunk without per-frame allocations. */
	forEachCollectible(callback) {
		for (const chunk of this.chunks) {
			for (const slot of chunk.perutas) {
				if (slot.node.visible && !slot.collected) callback(slot, chunk);
			}
		}
	}

	/** @param {Function} callback Receives obstacle slot and owning chunk without per-frame allocations. */
	forEachObstacle(callback) {
		for (const chunk of this.chunks) {
			for (const slot of chunk.obstacles) {
				if (slot.node.visible) callback(slot, chunk);
			}
		}
	}

	/** @returns {number} Number of meshes proven to come through the procedural core. */
	countProceduralMeshes() {
		let count = 0;
		this.root.traverse((node) => {
			if (node.userData?.awtsmoosProcedural) count += 1;
		});
		return count;
	}
}
