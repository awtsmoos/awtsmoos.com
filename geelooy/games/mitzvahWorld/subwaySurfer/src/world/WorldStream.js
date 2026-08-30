//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldStream.js
 * @description Owns bounded endless-world creation, motion, reset, and public iteration while dedicated query and recycler vessels handle evidence and horizon reuse.
 * The Awtsmoos renews horizon, carriage, coin, gift, and rhythm while yesterday's chunk becomes tomorrow's road;
 * Awtsmoos.com keeps endless play finite in memory as focused vessels share the measured load.
 */

import { OLAM_CONFIG } from "../config.js";
import { TiferesWorldChunk } from "./WorldChunk.js";
import { NetzachWorldStreamRecycler } from "./WorldStreamRecycler.js";
import { DaasWorldStreamQueries } from "./WorldStreamQueries.js";

export class YesodWorldStream {
	/**
	 * @description Captures scene/factory dependencies and composes empty live chunk storage with dedicated query and recycle collaborators.
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
		this.recycler = new NetzachWorldStreamRecycler(this.chunks);
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

	/**
	 * @description Restores challenge history, recycler generation, every chunk, hazard, and reward slot to deterministic opening state.
	 * @returns {void}
	 */
	reset() {
		this.dependencies.patternFactory.reset?.();
		this.recycler.reset();
		this.chunks.forEach((tiferesChunk, malchusIndex) => {
			const yesodZ = OLAM_CONFIG.firstChunkZ
				- malchusIndex * OLAM_CONFIG.chunkLength;
			tiferesChunk.reset(yesodZ, malchusIndex);
		});
	}

	/**
	 * @description Installs the runtime's read-only adaptive challenge provider without exposing runner state to chunks or obstacle factories.
	 * @param {Function} daasContextReader Zero-argument function returning bounded immutable challenge evidence.
	 * @returns {void}
	 */
	setChallengeReader(daasContextReader) {
		this.dependencies.patternFactory.setChallengeReader(daasContextReader);
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
				this.recycler.recycle(tiferesChunk);
			}
		}
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
