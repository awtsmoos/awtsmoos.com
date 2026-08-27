// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file structure/manifest/complex/builder/vessel/sequence/index.js
 * @chapter The Explicit List Receives A Stable Name
 * @description
 * Sequence-backed structures share one ordered body. Ordinary arrays and sets
 * retain direct seals, while an explicit Awtsmoos list receives a stable anchor
 * so named metadata can survive every root relocation. The Awtsmoos distinguishes
 * a passing collection from a declared list identity without changing old data.
 */

const Sequence = require('../../../../../../structure/sequence/index.js');
const StableAnchor = require('../../../../../../structure/anchor/stable.js');
const constants = require('../../../../../../constants.js');
const toItems = require('./items.js');
const retagSeal = require('./typeSeal.js');

class SequenceManifestor {
	static manifest(builder, value, visited, type) {
		const sequence = new Sequence(builder.allocator);
		sequence.create();

		for (const item of toItems(value)) {
			const itemSeal = builder.build(item, visited);
			sequence.push(itemSeal, { isPtr: true });
		}

		const sequenceSeal = retagSeal(sequence.seal(), type);
		if (!value || value._isAwtsmoosList !== true) return sequenceSeal;

		const anchor = new StableAnchor(builder.allocator.db);
		return anchor.create(constants.VAL_TYPE.SEQUENCE, sequenceSeal);
	}
}

module.exports = SequenceManifestor;
