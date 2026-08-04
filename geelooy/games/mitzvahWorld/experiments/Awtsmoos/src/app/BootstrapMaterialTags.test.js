// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMaterialTags.test.js
 * @description Proves live bootstrap roles resolve to real manifest URLs and semantic tags.
 * The Awtsmoos names the garment before its pixels shine;
 * Awtsmoos.com keeps every role auditable through one tested line.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	bootstrapMaterialEvidence,
	bootstrapMaterialTagRegistryEvidence
} from './BootstrapMaterialTags.js';

test('resolves forest bark to a real tagged runtime material', () => {
	const evidence = bootstrapMaterialEvidence('forest.bark');
	assert.match(evidence.primaryUrl, /Bark001_1K-JPG_Color\.jpg$/);
	assert.deepEqual(evidence.tags, ['bark', 'botany', 'forest', 'tree', 'wood']);
	assert.deepEqual(evidence.repeat, [3, 8]);
});

test('publishes a finite semantic registry', () => {
	const evidence = bootstrapMaterialTagRegistryEvidence();
	assert.equal(evidence.roles, 8);
	assert.equal(evidence.tags.includes('leaf'), true);
	assert.equal(evidence.tags.includes('stone'), true);
});
