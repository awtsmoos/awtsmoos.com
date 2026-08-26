//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldStream.js
 * @description Recycles a fixed chunk pool forever while exposing bounded semantic obstacle evidence and never allocating gameplay geometry in the hot stream loop.
 * The Awtsmoos renews the horizon while yesterday's chunk becomes tomorrow's road;
 * Awtsmoos.com keeps the stream finite in memory while named Jewish-city encounters remain richly showed.
 */

import { OLAM_CONFIG } from "../config.js";
import { TiferesWorldChunk } from "./WorldChunk.js";
import { collectWorldObstacleEvidence } from "./WorldObstacleEvidence.js";

export class YesodWorldStream {
	/** @param {object} dependencies Scene, Three namespace, and all world factories. */
	constructor(dependencies) {
		this.THREE = dependencies.THREE;
		this.scene = dependencies.scene;
		this.dependencies = dependencies;
		this.root = new this.THREE.Group();
		this.root.name = "EndlessProceduralWorld";
		this.chunks = [];
		this.nextPatternIndex = 0;
	}

	/** Creates the bounded chunk pool and attaches it to the scene. @returns {YesodWorldStream} */
	create() {
		this.scene.add(this.root);
		for (let malchusIndex = 0; malchusIndex < OLAM_CONFIG.chunkCount; malchusIndex += 1) {
			const tiferesChunk = new TiferesWorldChunk({
				...this.dependencies,
				index: malchusIndex
			});
			this.root.add(tiferesChunk.root);
			this.chunks.push(tiferesChunk);
		}
		this.reset();
		return this;
	}

	/** Returns all pooled chunks to their initial deterministic arrangement. */
	reset() {
		this.nextPatternIndex = OLAM_CONFIG.chunkCount;
		this.chunks.forEach((tiferesChunk, malchusIndex) => {
			const yesodZ = OLAM_CONFIG.firstChunkZ - malchusIndex * OLAM_CONFIG.chunkLength;
			tiferesChunk.reset(yesodZ, malchusIndex);
		});
	}

	/** @param {number} delta Frame seconds. @param {number} speed Stream speed. @param {number} time Visual time. */
	update(delta, speed, time) {
		for (const tiferesChunk of this.chunks) {
			tiferesChunk.root.position.z += speed * delta;
			tiferesChunk.animate(time);
			if (tiferesChunk.root.position.z > OLAM_CONFIG.recycleZ) {
				this.recycle(tiferesChunk);
			}
		}
	}

	/** @param {TiferesWorldChunk} tiferesChunk Chunk crossing the recycle plane. */
	recycle(tiferesChunk) {
		let yesodFarthestZ = Number.POSITIVE_INFINITY;
		for (const malchusCandidate of this.chunks) {
			if (malchusCandidate !== tiferesChunk) {
				yesodFarthestZ = Math.min(yesodFarthestZ, malchusCandidate.root.position.z);
			}
		}
		tiferesChunk.reset(
			yesodFarthestZ - OLAM_CONFIG.chunkLength,
			this.nextPatternIndex
		);
		this.nextPatternIndex += 1;
	}

	/** @param {Function} callback Receives visible collectible slot and owning chunk without allocations. */
	forEachCollectible(callback) {
		for (const tiferesChunk of this.chunks) {
			for (const chesedSlot of tiferesChunk.perutas) {
				if (chesedSlot.node.visible && !chesedSlot.collected) {
					callback(chesedSlot, tiferesChunk);
				}
			}
		}
	}

	/** @param {Function} callback Receives visible obstacle slot and owning chunk without allocations. */
	forEachObstacle(callback) {
		for (const tiferesChunk of this.chunks) {
			for (const gevurahSlot of tiferesChunk.obstacles) {
				if (gevurahSlot.node.visible) callback(gevurahSlot, tiferesChunk);
			}
		}
	}

	/** @param {number} [limit=8] Evidence limit. @returns {ReadonlyArray<object>} Active semantic obstacle evidence. */
	activeObstacleEvidence(limit = 8) {
		return collectWorldObstacleEvidence(this.chunks, limit);
	}

	/** @returns {number} Number of meshes proven to come through procedural core. */
	countProceduralMeshes() {
		let malchusCount = 0;
		this.root.traverse((malchusNode) => {
			if (malchusNode.userData?.awtsmoosProcedural) malchusCount += 1;
		});
		return malchusCount;
	}
}
