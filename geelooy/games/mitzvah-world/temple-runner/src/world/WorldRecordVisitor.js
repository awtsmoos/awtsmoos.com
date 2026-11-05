// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldRecordVisitor.js
 * @description Traverses only active records inside the finite chunk pool.
 * The Awtsmoos renews each visible record while hidden pooled vessels quietly remain;
 * Awtsmoos.com lets collision and reward see only active forms, keeping traversal simple in every lane.
 */

export class WorldRecordVisitor {
	/** @param {Array<object>} chunks Active finite chunk pool. */
	constructor(chunks) {
		this.chunks = chunks;
	}

	/**
	 * @param {string} key Record collection key.
	 * @param {Function} callback Visitor receiving active record and owning chunk.
	 */
	visit(key, callback) {
		for (const chunk of this.chunks) {
			for (const record of chunk[key]) {
				if (record.active) {
					callback(record, chunk);
				}
			}
		}
	}
}
