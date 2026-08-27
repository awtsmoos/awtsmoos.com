// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageMaterialReadability.test.mjs
 * @description Proves hydrated texture readiness cannot conceal a dark physical material family.
 * The Awtsmoos clothes timber darkly and stone warmly without erasing either; Awtsmoos.com
 * records exact low witnesses so one bright material cannot excuse a valley of crushed surfaces.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createReadabilityLedger,
	recordMaterialReadability,
	summarizeMaterialReadability
} from '../../diagnostics/VillageMaterialReadability.js';

const readableLighting = { diffuseFloor: 0.46 };

test('neutral textured stone and terrain pass conservative family floors', () => {
	const ledger = createReadabilityLedger();
	recordMaterialReadability(
		ledger,
		'cottage stone wall',
		material([0.9, 0.82, 0.7]),
		readableLighting,
		true
	);
	recordMaterialReadability(
		ledger,
		'terrain meadow grass',
		material([0.94, 0.98, 0.9]),
		readableLighting,
		true
	);
	const result = summarizeMaterialReadability(ledger);
	assert.equal(result.readable, true);
	assert.equal(result.families.masonry.count, 1);
	assert.equal(result.families.terrain.count, 1);
	assert.equal(result.families.masonry.lowest[0].identity, 'cottage stone wall');
});

test('hydrated but crushed masonry fails with exact low witnesses', () => {
	const ledger = createReadabilityLedger();
	for (let index = 0; index < 10; index += 1) {
		recordMaterialReadability(
			ledger,
			`house stone wall ${index}`,
			material([0.12, 0.12, 0.12]),
			readableLighting,
			true
		);
	}
	const result = summarizeMaterialReadability(ledger);
	assert.equal(result.readable, false);
	assert.ok(result.warnings.includes('masonry-below-readable-material-floor'));
	assert.equal(result.families.masonry.lowest.length, 6);
	assert.equal(result.families.masonry.lowest[0].mapReady, true);
	assert.deepEqual(result.families.masonry.lowest[0].color, [0.12, 0.12, 0.12]);
});

function material(color) {
	return { color };
}
