//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldStream.js
 * @description Owns bounded endless-world creation, motion, reset, and recycling while a dedicated Daas query vessel exposes pooled Perutas, powers, hazards, and diagnostics.
 * The Awtsmoos renews horizon, carriage, coin, and gift while yesterday's chunk becomes tomorrow's road;
 * Awtsmoos.com keeps the endless world finite in memory while richer gameplay passes through the same measured load.
 */

import { OLAM_CONFIG } from "../config.js";
import { TiferesWorldChunk } from "./WorldChunk.js";
import { DaasWorldStreamQueries } from "./WorldStreamQueries.js";

export class YesodWorldStream {
	/**
	 * @description Captures scene/factory dependencies and prepares an empty root plus live chunk array shared with the dedicated query vessel.
	 * @param {object} chochmahDependencies Scene, Three namespace, and all world factories.
	 */
	constructor(chochmahDependencies) {
		this.THREE = chochmahDependencies.THREE;
		this.scene = chochmahDependencies.scene;
		this.dependencies = chochmahDependencies;
		this.root = new this.THREE.Group();
		this.root.name = "EndlessProceduralWorld";
		this.chunks = [];
		this.queries = new DaasWorldStreamQueries(this.chunks);
		this.nextPatternIndex = 0;
	}

	/**
	 * @description Creates the bounded chunk pool exactly once, attaches it to the scene, and reveals the deterministic opening arrangement.
	 * @returns {YesodWorldStream} Initialized endless stream.
	 */
	create() {
		this.scene.add(this.root);
		for (
			let malchusIndex = 0;
			malchusIndex < OLAM_CONFIG.chunkCount;
			malchusIndex += 1
		) {
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

	/** @description Restores every chunk, hazard, and reward slot to deterministic opening state. @returns {void} */
	reset() {
		this.nextPatternIndex = OLAM_CONFIG.chunkCount;
		this.chunks.forEach((tiferesChunk, malchusIndex) => {
			const yesodZ = OLAM_CONFIG.firstChunkZ
				- malchusIndex * OLAM_CONFIG.chunkLength;
			tiferesChunk.reset(yesodZ, malchusIndex);
		});
	}

	/**
	 * @description Advances road roots, slot-local hazards, reward transforms, and bounded recycling in deterministic frame order.
	 * @param {number} tiferesDelta Bounded frame duration in seconds.
	 * @param {number} netzachSpeed Current runner/world speed.
	 * @param {number} hodTime Running visual time.
	 * @returns {void}
	 */
	update(tiferesDelta, netzachSpeed, hodTime) {
		for (const tiferesChunk of this.chunks) {
			tiferesChunk.root.position.z += netzachSpeed * tiferesDelta;
			tiferesChunk.animate(tiferesDelta, netzachSpeed, hodTime);
			if (tiferesChunk.root.position.z > OLAM_CONFIG.recycleZ) {
				this.recycle(tiferesChunk);
			}
		}
	}

	/**
	 * @description Moves one passed chunk behind the farthest remaining chunk and assigns the next deterministic challenge index.
	 * @param {TiferesWorldChunk} tiferesChunk Chunk crossing the recycle plane.
	 * @returns {void}
	 */
	recycle(tiferesChunk) {
		let yesodFarthestZ = Number.POSITIVE_INFINITY;
		for (const malchusCandidate of this.chunks) {
			if (malchusCandidate !== tiferesChunk) {
				yesodFarthestZ = Math.min(
					yesodFarthestZ,
					malchusCandidate.root.position.z
				);
			}
		}
		tiferesChunk.reset(
			yesodFarthestZ - OLAM_CONFIG.chunkLength,
			this.nextPatternIndex
		);
		this.nextPatternIndex += 1;
	}

	/** @description Delegates allocation-free Peruta iteration. @param {Function} chesedCallback Reward callback. @returns {void} */
	forEachCollectible(chesedCallback) {
		this.queries.forEachCollectible(chesedCallback);
	}

	/** @description Delegates allocation-free sparse power-up iteration. @param {Function} ohrCallback Special-reward callback. @returns {void} */
	forEachPowerUp(ohrCallback) {
		this.queries.forEachPowerUp(ohrCallback);
	}

	/** @description Delegates allocation-free visible hazard iteration. @param {Function} gevurahCallback Hazard callback. @returns {void} */
	forEachObstacle(gevurahCallback) {
		this.queries.forEachObstacle(gevurahCallback);
	}

	/** @description Returns bounded semantic obstacle evidence. @param {number} [malchusLimit=8] Evidence limit. @returns {ReadonlyArray<object>} Evidence records. */
	activeObstacleEvidence(malchusLimit = 8) {
		return this.queries.activeObstacleEvidence(malchusLimit);
	}

	/** @description Counts procedural-core-generated meshes through the query vessel. @returns {number} Procedural mesh count. */
	countProceduralMeshes() {
		return this.queries.countProceduralMeshes(this.root);
	}
}
