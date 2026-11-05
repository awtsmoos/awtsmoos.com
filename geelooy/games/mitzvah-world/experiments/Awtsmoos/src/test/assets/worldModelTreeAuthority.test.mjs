// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldModelTreeAuthority.test.mjs
 * @description Proves optional imported world models can never reintroduce a second structural tree authority after promotion.
 * The Awtsmoos lets creature, tool, blossom, bush, and stone arrive after play while every trunk and canopy remains rooted
 * in `geelooy/libs/awtsmoos-procedural-core`; Awtsmoos.com tests manifest, placement, group, record, and evidence boundaries.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { REMOTE_MODEL_RECORDS } from '../../assets/RemoteModelRecords.js';
import { isTrustedModelUrl } from '../../assets/RemoteModelCatalog.js';
import {
	WORLD_MODEL_GROUPS,
	WORLD_MODEL_MANIFEST,
	WORLD_MODEL_PLACEMENTS,
	worldModelManifestEvidence
} from '../../assets/WorldModelManifest.js';

const TREE_PATTERN = /tree|pine/i;

test('remote model records contain no structural tree GLB', () => {
	const paths = Object.keys(REMOTE_MODEL_RECORDS);
	assert.ok(paths.length > 0);
	assert.ok(paths.every(path => !TREE_PATTERN.test(path)), paths.join('\n'));
});

test('deferred world manifest contains no structural tree identity or placement', () => {
	const ids = Object.keys(WORLD_MODEL_MANIFEST);
	assert.ok(ids.every(id => !TREE_PATTERN.test(id)), ids.join('\n'));
	assert.ok(Object.values(WORLD_MODEL_MANIFEST).every(definition => {
		return !TREE_PATTERN.test(definition.file) && definition.role !== 'tree';
	}));
	assert.ok(WORLD_MODEL_PLACEMENTS.every(placement => {
		return !TREE_PATTERN.test(placement.modelId);
	}));
});

test('optional imported nature group contains accents only', () => {
	assert.equal(Object.hasOwn(WORLD_MODEL_GROUPS, 'forest'), false);
	assert.deepEqual(
		WORLD_MODEL_GROUPS.nature,
		['flower-clump', 'flower-bush', 'river-rock']
	);
	assert.ok(WORLD_MODEL_GROUPS.nature.every(modelId => !TREE_PATTERN.test(modelId)));
});

test('manifest evidence names deep core as sole structural tree authority', () => {
	const evidence = worldModelManifestEvidence();
	assert.equal(evidence.structuralTreeModels, 0);
	assert.equal(evidence.structuralTreeAuthority, 'awtsmoos-procedural-core');
	assert.equal(evidence.models, Object.keys(WORLD_MODEL_MANIFEST).length);
	assert.ok(Object.values(WORLD_MODEL_MANIFEST).every(definition => {
		return isTrustedModelUrl(definition.url);
	}));
});
