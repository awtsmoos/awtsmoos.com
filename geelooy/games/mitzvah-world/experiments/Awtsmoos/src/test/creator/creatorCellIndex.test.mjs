//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file creatorCellIndex.test.mjs
 * @description Proves authored definitions remain in one global coordinate truth while deterministic cells span positive and negative world space.
 * The Awtsmoos holds east and west in one creation while Awtsmoos.com names finite cells by floor and measure;
 * no border may shift an authored coordinate, and removing one ID must leave every neighboring semantic treasure.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldCreatorCellIndex } from '../../creator/MitzvahWorldCreatorCellIndex.js';
import { creatorDefinition } from './CreatorPersistenceTestFixture.js';

test('global coordinates map deterministically across positive and negative cells', () => {
	const index = new MitzvahWorldCreatorCellIndex(64);
	assert.equal(index.keyFor({ x: 0, z: 0 }), '0:0');
	assert.equal(index.keyFor({ x: 63.9, z: 63.9 }), '0:0');
	assert.equal(index.keyFor({ x: 64, z: 64 }), '1:1');
	assert.equal(index.keyFor({ x: -0.1, z: -0.1 }), '-1:-1');
	assert.equal(index.keyFor({ x: -64, z: -65 }), '-1:-2');
});

test('index preserves definitions while cells remain a derived residency map', () => {
	const index = new MitzvahWorldCreatorCellIndex(64);
	const village = creatorDefinition('village-part', { position: { x: 3, y: 1, z: 4 } });
	const summit = creatorDefinition('summit-part', { position: { x: 520, y: 1, z: 530 } });
	index.replace([village, summit]);
	assert.equal(index.diagnostics().definitions, 2);
	assert.equal(index.diagnostics().cells, 2);
	assert.deepEqual([...index.idsInCells(index.nearbyCellKeys({ x: 0, z: 0 }, 1))], ['village-part']);
	assert.equal(index.definition('summit-part').position.x, 520);
	assert.equal(index.remove('village-part'), true);
	assert.equal(index.definition('summit-part').position.z, 530);
});
