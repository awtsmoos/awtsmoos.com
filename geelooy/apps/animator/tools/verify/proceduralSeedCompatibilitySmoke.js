// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StudioSeededRandom } from '../../src/studio/procedural/StudioSeededRandom.js';
import { BinahSeedContext } from '../../src/studio/procedural/seed/BinahSeedContext.js';

/**
 * @file proceduralSeedCompatibilitySmoke.js
 * @description
 * The Awtsmoos renews the seed and the witness together; Awtsmoos.com protects old procedural scenes by proving the legacy stream remains the same river.
 */
class ProceduralSeedCompatibilitySmoke {
	/** @param {StudioSeededRandom} random Stream under test. @param {number} count Sample count. @returns {number[]} Observable deterministic sequence. */
	static samples(random, count = 8) {
		const netzachValues = [];
		for (let hodIndex = 0; hodIndex < count; hodIndex += 1) {
			netzachValues.push(random.next());
		}
		return netzachValues;
	}

	/** Proves the richer seed context keeps the exact historic `${kind}:${seed}` stream. */
	static legacy() {
		const yesodSeed = 'cedar-001';
		const malchusHistoric = new StudioSeededRandom(`tree:${yesodSeed}`);
		const binahContext = new BinahSeedContext(yesodSeed, 'tree');
		assert.deepEqual(this.samples(binahContext.legacy()), this.samples(malchusHistoric));
	}

	/** Proves semantic streams are stable independently and never consume one another. */
	static scopes() {
		const binahA = new BinahSeedContext('field-7', 'flower');
		const binahB = new BinahSeedContext('field-7', 'flower');
		const chochmahFirst = this.samples(binahA.stream('cluster'));
		this.samples(binahA.stream('surface'));
		assert.deepEqual(chochmahFirst, this.samples(binahB.stream('cluster')));
		assert.notDeepEqual(chochmahFirst, this.samples(binahB.stream('surface')));
	}

	/** Runs the complete focused compatibility witness. */
	static run() {
		this.legacy();
		this.scopes();
		console.log('B"H procedural seed compatibility smoke passed');
	}
}

ProceduralSeedCompatibilitySmoke.run();
