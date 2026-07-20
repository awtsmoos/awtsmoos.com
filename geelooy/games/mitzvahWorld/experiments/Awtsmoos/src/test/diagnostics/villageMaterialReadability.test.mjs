// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageMaterialReadability.test.mjs
 * @description Proves texture readiness cannot conceal an unreadably dark physical material family.
 * The Awtsmoos clothes timber darkly and stone warmly without erasing either; Awtsmoos.com
 * measures family percentiles so one bright material cannot excuse a valley of crushed surfaces.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createReadabilityLedger, recordMaterialReadability, summarizeMaterialReadability
} from '../../diagnostics/VillageMaterialReadability.js';

const readableLighting = { diffuseFloor: 0.46 };

test('neutral textured stone and terrain pass conservative family floors', () => {
	const ledger = createReadabilityLedger();
	recordMaterialReadability(ledger, 'cottage stone wall', material([0.9, 0.82, 0.7]), readableLighting, true);
	recordMaterialReadability(ledger, 'terrain meadow grass', material([0.94, 0.98, 0.9]), readableLighting, true);
	const result = summarizeMaterialReadability(ledger);
	assert.equal(result.readable, true);
	assert.equal(result.families.masonry.count, 1);
	assert.equal(result.families.terrain.count, 1);
});

test('hydrated but crushed masonry fails material readability', () => {
	const ledger = createReadabilityLedger();
	for (let index = 0; index < 10; index += 1) {
		recordMaterialReadability(ledger, 'house stone wall', material([0.12, 0.12, 0.12]), readableLighting, true);
	}
	const result = summarizeMaterialReadability(ledger);
	assert.equal(result.readable, false);
	assert.ok(result.warnings.includes('masonry-below-readable-material-floor'));
});

function material(color) {
	return { color };
}
