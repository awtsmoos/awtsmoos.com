// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestAuthoredAlpha.test.mjs
 * @description Proves uploaded species leaves bypass legacy green-screen conversion unchanged.
 * The Awtsmoos reveals each leaf through its own authored edge and color; Awtsmoos.com reserves
 * chroma key for opaque legacy cards while transparent tree-library PNGs remain their own vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { remoteTreeTextureUrl } from '../../assets/RemoteTextureCatalog.js';
import {
	createForestLeafPublicTexture,
	forestLeafPublicTextureContract
} from '../../world/trees/ForestLeafTexture.js';

test('B"H uploaded tree image preserves authored alpha and object identity', () => {
	const image = {
		complete: true,
		dataset: {},
		naturalHeight: 2048,
		naturalWidth: 2048,
		src: remoteTreeTextureUrl('willow leaf.png')
	};
	const prepared = createForestLeafPublicTexture(image);
	assert.equal(prepared, image);
	assert.equal(image.dataset.awtsmoosTransform, 'authored-alpha-preserved');
	assert.equal(image.dataset.colorFamily, 'species-authored');
});

test('B"H contract keeps legacy chroma key narrow and authored alpha primary', () => {
	const contract = forestLeafPublicTextureContract();
	assert.equal(contract.authoredAlphaPreserved, true);
	assert.equal(contract.legacyTransformOnly, true);
	assert.equal(contract.transform, 'chai-leaf-background-to-alpha-mask');
	assert.deepEqual(contract.backgroundRgb, [72, 108, 85]);
	assert.match(contract.authoredPath, /ilanos\/trees/);
});
