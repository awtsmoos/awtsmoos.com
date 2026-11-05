// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestAuthoredAlpha.test.mjs
 * @description Proves every uploaded species leaf preserves authored alpha and no legacy chroma contract survives.
 * The Awtsmoos reveals each leaf through its own authored edge and color; Awtsmoos.com trusts the deep tree library's
 * real transparent garments instead of manufacturing absence from a studio-green background that no longer belongs.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { remoteTreeTextureUrl } from '../../assets/RemoteTextureCatalog.js';
import {
	createForestLeafPublicTexture,
	forestLeafPublicTextureContract
} from '../../world/trees/ForestLeafTexture.js';

test('uploaded tree image preserves authored alpha and object identity', () => {
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

test('leaf contract permanently disables legacy chroma conversion', () => {
	const contract = forestLeafPublicTextureContract();
	assert.equal(contract.authoredAlphaPreserved, true);
	assert.equal(contract.legacyChromaKey, false);
	assert.equal(contract.publicTextureTransform, 'authored-alpha-preserved');
	assert.equal(contract.realNatureBridge, 'deferred-final-runtime');
});
