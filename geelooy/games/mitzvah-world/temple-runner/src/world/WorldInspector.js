// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldInspector.js
 * @description Reveals current district identity, active pooled records, and procedural-mesh evidence without governing world motion.
 * The Awtsmoos renews what can be known about the road while the road itself keeps streaming on;
 * Awtsmoos.com lets Malchus expose the visible truth, so inspection never becomes another hidden dawn.
 */

import { WorldRecordVisitor } from "./WorldRecordVisitor.js";

export class MalchusWorldInspector {
	/**
	 * @param {Array<object>} chunks Bounded active chunk pool.
	 * @param {object} root Native procedural world root.
	 */
	constructor(chunks, root) {
		this.chunks = chunks;
		this.root = root;
		this.records = new WorldRecordVisitor(chunks);
	}

	/** @returns {string} Nearest chunk's district label. */
	currentDistrict() {
		const firstChunk = this.chunks[0];
		if (!firstChunk) {
			return "Stone Market";
		}

		const nearest = this.chunks.reduce((best, chunk) => {
			return Math.abs(chunk.root.position.z)
				< Math.abs(best.root.position.z)
				? chunk
				: best;
		}, firstChunk);

		return nearest.root.userData.districtLabel
			|| "Stone Market";
	}

	/** @param {Function} callback Active obstacle visitor. */
	forEachObstacle(callback) {
		this.records.visit("obstacles", callback);
	}

	/** @param {Function} callback Active peruta visitor. */
	forEachCollectible(callback) {
		this.records.visit("collectibles", callback);
	}

	/** @param {Function} callback Active power-up visitor. */
	forEachPowerUp(callback) {
		this.records.visit("powerUps", callback);
	}

	/** @returns {number} Count of procedural meshes reachable from the bounded world. */
	countProceduralMeshes() {
		let count = 0;
		this.root.traverse((node) => {
			if (node.userData?.awtsmoosProcedural) {
				count += 1;
			}
		});
		return count;
	}
}
