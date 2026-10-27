// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteTextureTransportTrust.test.mjs
 * @description Proves every texture root emitted by the transport is trusted by the same covenant.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	fullResolutionTextureUrl,
	isTrustedAwtsmoosMaterialUrl,
	remoteTexturePathUrl,
	trustedRemoteTextureSourcePath,
	treeTextureUrl
} from '../../assets/RemoteTextureTransport.js';

test('general Awtsmoos Drive texture root is trusted and reversible', () => {
	const url = remoteTexturePathUrl('materials/stone wall.png');
	assert.equal(isTrustedAwtsmoosMaterialUrl(url), true);
	assert.equal(trustedRemoteTextureSourcePath(url), '/materials/stone wall.png');
});

test('original full-resolution library root is trusted and reversible', () => {
	const url = fullResolutionTextureUrl('tiled roof 2.png');
	assert.equal(isTrustedAwtsmoosMaterialUrl(url), true);
	assert.equal(trustedRemoteTextureSourcePath(url), '/full-resolution/tiled roof 2.png');
});

test('original tree library root is trusted and reversible', () => {
	const url = treeTextureUrl('rough bark.jpg');
	assert.equal(isTrustedAwtsmoosMaterialUrl(url), true);
	assert.equal(
		trustedRemoteTextureSourcePath(url),
		'/awtsmoos-nature/ilanos/trees/rough bark.jpg'
	);
});

test('trust rejects foreign, insecure, queried, encoded traversal and model URLs', () => {
	const valid = remoteTexturePathUrl('materials/stone.png');
	assert.equal(isTrustedAwtsmoosMaterialUrl(valid.replace('https:', 'http:')), false);
	assert.equal(isTrustedAwtsmoosMaterialUrl(valid.replace('awtsmoos.com', 'example.com')), false);
	assert.equal(isTrustedAwtsmoosMaterialUrl(`${valid}?cache=1`), false);
	assert.equal(isTrustedAwtsmoosMaterialUrl(`${valid}#fragment`), false);
	assert.equal(isTrustedAwtsmoosMaterialUrl(
		'https://awtsmoos.com/api/social/drive/public/awtsmoos/materials/%252e%252e/other.png'
	), false);
	assert.equal(isTrustedAwtsmoosMaterialUrl(
		'https://awtsmoos.com/api/social/drive/public/awtsmoos/assets/mitzvah-world/models/tree.glb'
	), false);
});
