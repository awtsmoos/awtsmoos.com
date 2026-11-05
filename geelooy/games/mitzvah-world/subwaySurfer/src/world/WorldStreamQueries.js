//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldStreamQueries.js
 * @description Owns allocation-free reward/hazard iteration and bounded gameplay-relevant diagnostics so world lifecycle remains focused on streaming rather than inspection.
 * The Awtsmoos renews every visible coin, aid, hazard, and procedural mesh before a query calls it found;
 * Awtsmoos.com lets Daas inspect fixed pools without manufacturing another gameplay structure around.
 */

import { collectWorldObstacleEvidence } from "./WorldObstacleEvidence.js";

export class DaasWorldStreamQueries {
	/**
	 * @description Captures the fixed chunk-pool array by reference so every query observes current recycled/moving slot state without rebuilding indexes.
	 * @param {Array<object>} tiferesChunks Live bounded world-chunk pool.
	 */
	constructor(tiferesChunks) {
		this.chunks = tiferesChunks;
	}

	/**
	 * @description Iterates visible uncollected Perutas directly from pooled records without allocating an intermediate array.
	 * @param {Function} chesedCallback Receives common-reward slot and owning chunk.
	 * @returns {void}
	 */
	forEachCollectible(chesedCallback) {
		for (const tiferesChunk of this.chunks) {
			for (const chesedSlot of tiferesChunk.perutas) {
				if (chesedSlot.node.visible && !chesedSlot.collected) {
					chesedCallback(chesedSlot, tiferesChunk);
				}
			}
		}
	}

	/**
	 * @description Iterates visible uncollected sparse power-ups from the one fixed special-reward slot owned by each chunk.
	 * @param {Function} ohrCallback Receives special-reward slot and owning chunk.
	 * @returns {void}
	 */
	forEachPowerUp(ohrCallback) {
		for (const tiferesChunk of this.chunks) {
			const chesedPower = tiferesChunk.powerUp;
			if (chesedPower.node.visible && !chesedPower.collected) {
				ohrCallback(chesedPower, tiferesChunk);
			}
		}
	}

	/**
	 * @description Iterates currently visible static or moving hazards directly from pooled semantic slot records.
	 * @param {Function} gevurahCallback Receives obstacle slot and owning chunk.
	 * @returns {void}
	 */
	forEachObstacle(gevurahCallback) {
		for (const tiferesChunk of this.chunks) {
			for (const gevurahSlot of tiferesChunk.obstacles) {
				if (gevurahSlot.node.visible) {
					gevurahCallback(gevurahSlot, tiferesChunk);
				}
			}
		}
	}

	/**
	 * @description Produces immutable semantic hazard evidence ordered by imminent gameplay relevance across the complete fixed obstacle pool.
	 * @param {number} [malchusLimit=18] Maximum evidence records returned.
	 * @returns {ReadonlyArray<object>} Active obstacle evidence.
	 */
	activeObstacleEvidence(malchusLimit = 18) {
		return collectWorldObstacleEvidence(this.chunks, malchusLimit);
	}

	/**
	 * @description Counts scene meshes explicitly marked as procedural-core outputs without altering the scene graph.
	 * @param {object} malchusRoot Endless-world Three root.
	 * @returns {number} Procedural mesh count.
	 */
	countProceduralMeshes(malchusRoot) {
		let malchusCount = 0;
		malchusRoot.traverse((malchusNode) => {
			if (malchusNode.userData?.awtsmoosProcedural) {
				malchusCount += 1;
			}
		});
		return malchusCount;
	}
}
