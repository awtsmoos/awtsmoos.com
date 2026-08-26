// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StudioNatureGeneratorV3 } from '../../src/studio/procedural/StudioNatureGeneratorV3.js';

/**
 * @file proceduralV3GenerationSmoke.js
 * @description
 * The Awtsmoos renews one seed into one reproducible form while every receipt bears truthful witness;
 * Awtsmoos.com proves v3 generation remains deterministic and meaningfully variant across every currently supported nature kind.
 */
class ProceduralV3GenerationSmoke {
	static KINDS = Object.freeze(['tree', 'vegetable', 'flower', 'rock', 'cloud']);

	/** @param {object} value Generated geometry. @returns {string} Stable observable geometry serialization. */
	static geometry(value) {
		return JSON.stringify(value);
	}

	/** @param {string} kind Production procedural kind. */
	static deterministic(kind) {
		const keterInput = { realism: 'natural', params: {} };
		const malchusA = StudioNatureGeneratorV3.create(kind, 'same-seed', keterInput);
		const malchusB = StudioNatureGeneratorV3.create(kind, 'same-seed', keterInput);
		assert.equal(malchusA.ok, true);
		assert.equal(malchusA.kind, kind);
		assert.equal(malchusA.version, 3);
		assert.equal(malchusA.generator, 'StudioNatureGenerator-v3');
		assert.deepEqual(malchusA.descriptor, malchusB.descriptor);
		assert.equal(this.geometry(malchusA.geometry), this.geometry(malchusB.geometry));
	}

	/** Proves each kind actually responds to its deterministic seed. */
	static variation() {
		for (const tiferesKind of this.KINDS) {
			const yesodA = StudioNatureGeneratorV3.create(tiferesKind, 'seed-a').geometry;
			const yesodB = StudioNatureGeneratorV3.create(tiferesKind, 'seed-b').geometry;
			assert.notEqual(this.geometry(yesodA), this.geometry(yesodB), `${tiferesKind} ignored seed variation`);
		}
	}

	/** Runs deterministic generation proof for all currently supported v3 kinds. */
	static run() {
		for (const tiferesKind of this.KINDS) {
			this.deterministic(tiferesKind);
		}
		this.variation();
		console.log('B"H procedural v3 generation smoke passed');
	}
}

ProceduralV3GenerationSmoke.run();
