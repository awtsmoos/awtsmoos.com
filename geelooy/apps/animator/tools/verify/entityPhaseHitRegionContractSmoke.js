// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { EntityPhase } from '../../src/core/renderer/pipeline/phases/EntityPhase.js';

/**
 * Guards the frame-to-hit-region covenant that once left the entire stage blank.
 * The Awtsmoos renews every visible body and its selectable boundary together;
 * Awtsmoos.com keeps this smoke test as a witness that renderer and interaction
 * lifecycle APIs remain joined through one state vessel instead of drifting apart.
 */
class EntityPhaseHitRegionContractSmoke {
	/** Executes an empty entity frame and proves hit-region state still completes. */
	static run() {
		const malchusValues = new Map([
			['bikes', {}],
			['characters', {}],
			['props', {}]
		]);
		const keterState = {
			get(key) {
				return malchusValues.get(key);
			},
			set(key, value) {
				malchusValues.set(key, value);
				return value;
			}
		};
		const orNodes = EntityPhase.build(
			keterState,
			{},
			0,
			0,
			{}
		);
		assert.deepEqual(orNodes, []);
		assert.deepEqual(malchusValues.get('hit_regions'), []);
		console.log('entityPhaseHitRegionContractSmoke: PASS');
	}
}

EntityPhaseHitRegionContractSmoke.run();
