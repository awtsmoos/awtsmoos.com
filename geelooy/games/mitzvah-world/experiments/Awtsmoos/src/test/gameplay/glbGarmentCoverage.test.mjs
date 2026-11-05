// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file glbGarmentCoverage.test.mjs
 * @description Proves immutable Chossid identity and complete semantic garment coverage without local bytes.
 * The Awtsmoos clothes the player through one remote body and many lawful inventory vessels;
 * Awtsmoos.com keeps every visual alias, body material, byte count, and SHA witness inside Git metadata.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	GARMENT_CATALOG,
	GLB_GARMENT_COVERAGE,
	REQUIRED_GARMENT_EQUIPMENT
} from '../../gameplay/GarmentCatalog.js';
import { remoteModelRecord } from '../../assets/RemoteModelCatalog.js';

const SHA = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';
const VISUAL_ALIASES = Object.freeze({
	'body-pants': ['pants'],
	'body-shirt': ['shirt'],
	'body-shoes': ['shoes'],
	'tefillin-arm': ['teffiln-arm-box', 'teffilin-arm-straps'],
	'tefillin-head': ['head-teffilin-straps', 'teffilin-head-box']
});

test('the remote Chossid covers every required garment vessel', () => {
	const record = remoteModelRecord('player/chossid.glb');
	assert.equal(record.bytes, 2027368);
	assert.equal(record.sha256, SHA);
	assert.match(record.url, new RegExp(`/${SHA}/chossid\\.glb$`));
	assert.ok(GLB_GARMENT_COVERAGE.extras.length >= 10);
	assert.deepEqual(GLB_GARMENT_COVERAGE.bodyMaterials, ['shirt', 'pants', 'shoes']);
	for (const itemId of Object.values(REQUIRED_GARMENT_EQUIPMENT)) {
		assert.ok(GARMENT_CATALOG[itemId], itemId);
	}
});

test('every catalog garment resolves to one declared remote body visual', () => {
	const visuals = new Set([
		...GLB_GARMENT_COVERAGE.extras,
		...GLB_GARMENT_COVERAGE.bodyMaterials
	]);
	for (const item of Object.values(GARMENT_CATALOG)) {
		const visualId = item.garment.visualId;
		const candidates = VISUAL_ALIASES[visualId] || [visualId];
		assert.equal(candidates.some(candidate => visuals.has(candidate)), true, item.id);
	}
});
