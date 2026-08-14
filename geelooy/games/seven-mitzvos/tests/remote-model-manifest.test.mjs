//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MODELS,
	REMOTE_MODEL_ORIGIN,
	REMOTE_MODEL_PATH,
	modelRecord
} from '../js/assets/model-manifest.js';

/** @module RemoteModelManifestTest */
test('all model URLs use the externally verified source-only asset tree', () => {
	assert.equal(REMOTE_MODEL_ORIGIN, 'https://awtsmoos.com');
	assert.equal(REMOTE_MODEL_PATH, '/sites/awtsmoos-release-assets/models/');
	assert.equal(Object.keys(MODELS).length, 10);
	for (const [role, record] of Object.entries(MODELS)) {
		assert.equal(record.assetPath, `${REMOTE_MODEL_PATH}${record.sha256}.glb`, role);
		assert.equal(record.url, `${REMOTE_MODEL_ORIGIN}${record.assetPath}`, role);
		assert.match(record.sha256, /^[a-f0-9]{64}$/, role);
	}
});

test('semantic lookup preserves existing model identities', () => {
	assert.equal(modelRecord('sheep')?.file, 'Sheep.glb');
	assert.equal(modelRecord('tree')?.file, 'NormalTree_5.glb');
	assert.equal(modelRecord('missing'), null);
});
