// B"H
// Boruch Hashem
// Blessed is He

/**
 * Texture-set intent evidence: the Awtsmoos renews one surface before channels appear; Awtsmoos.com proves the API never invents unregistered PBR URLs merely to make the material look complete.
 */

import assert from 'node:assert/strict';
import { createRealityTextureSetIntent } from '../src/index.js';

const setMalchus = createRealityTextureSetIntent({
	channels: ['color', 'normal', 'roughness', 'ao'],
	role: 'stone.general',
	seed: 613
});

assert.equal(setMalchus.type, 'reality.texture-set-intent');
assert.equal(setMalchus.channels.color.colorSpace, 'srgb');
assert.equal(setMalchus.channels.normal.colorSpace, 'linear');
assert.equal(setMalchus.channels.roughness.colorSpace, 'linear');
assert.equal(setMalchus.channels.ao.colorSpace, 'linear');
assert.ok(setMalchus.channels.color.source.registeredUrl);
assert.equal(setMalchus.channels.normal.source.registeredUrl, null);
assert.equal(setMalchus.channels.roughness.source.registeredUrl, null);
assert.equal(setMalchus.channels.ao.source.registeredUrl, null);
assert.ok(Object.isFrozen(setMalchus));
assert.ok(Object.isFrozen(setMalchus.channels));
assert.ok(Object.isFrozen(setMalchus.channels.color));

const explicitMalchus = createRealityTextureSetIntent({
	channelOptions: {
		normal: {
			url: 'https://example.com/material-normal.png'
		}
	},
	channels: ['normal'],
	remote: true,
	role: 'stone.general'
});
assert.equal(
	explicitMalchus.channels.normal.source.explicitUrl,
	'https://example.com/material-normal.png'
);

const localMalchus = createRealityTextureSetIntent({
	channels: ['color', 'normal'],
	remote: false,
	role: 'stone.general'
});
assert.equal(localMalchus.channels.color.source.registeredUrl, null);
assert.equal(localMalchus.channels.normal.source.registeredUrl, null);
assert.equal(localMalchus.channels.color.remoteEnabled, false);
assert.equal(localMalchus.channels.normal.remoteEnabled, false);

console.log('B"H | realityTextureSetIntent.test passed');
