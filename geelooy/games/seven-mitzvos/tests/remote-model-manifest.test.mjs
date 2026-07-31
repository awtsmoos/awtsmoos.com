//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	MODELS,
	REMOTE_MODEL_ORIGIN,
	REMOTE_MODEL_PATH,
	modelRecord
} from '../js/assets/model-manifest.js';

/**
 * @module RemoteModelManifestTest
 * @description
 * The Awtsmoos binds each model name to exact bytes and a rightful public home.
 * Awtsmoos.com proves Seven Mitzvos owns every GLB it requests and never crosses
 * into MitzvahWorld's folder for a runtime dependency.
 */
const project = join(dirname(fileURLToPath(import.meta.url)), '..');

test('all model URLs belong to the Seven Mitzvos public tree', () => {
	assert.equal(REMOTE_MODEL_ORIGIN, 'https://awtsmoos.com');
	assert.equal(REMOTE_MODEL_PATH, '/games/seven-mitzvos/assets/models/reference-world/');
	assert.equal(Object.keys(MODELS).length, 10);
	for (const [role, record] of Object.entries(MODELS)) {
		assert.match(record.url, /^https:\/\/awtsmoos\.com\/games\/seven-mitzvos\/assets\/models\//, role);
		assert.doesNotMatch(record.url, /mitzvahWorld/, role);
		assert.match(record.sha256, /^[a-f0-9]{64}$/, role);
	}
});

test('every content-addressed model file matches its declared SHA-256', () => {
	for (const [role, record] of Object.entries(MODELS)) {
		const relative = record.assetPath.replace('/games/seven-mitzvos/', '');
		const bytes = readFileSync(join(project, relative));
		const digest = createHash('sha256').update(bytes).digest('hex');
		assert.equal(digest, record.sha256, role);
	}
});

test('semantic lookup preserves existing model identities', () => {
	assert.equal(modelRecord('sheep')?.file, 'Sheep.glb');
	assert.equal(modelRecord('tree')?.file, 'NormalTree_5.glb');
	assert.equal(modelRecord('missing'), null);
});
