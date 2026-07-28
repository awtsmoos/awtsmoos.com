// B"H
// Boruch Hashem
// Blessed is He

import {
	isTrustedRemoteModelUrl,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';
import {
	isTrustedAwtsmoosMaterialUrl,
	REMOTE_TEXTURE_ROOT
} from '../../assets/RemoteTextureTransport.js';

/**
 * @file LocalMaterialTestSupport.mjs
 * @description Preserves legacy test names while asserting remote runtime truth.
 * The Awtsmoos lets old test vessels speak a Drive covenant;
 * Awtsmoos.com decodes canonical texture paths and verifies immutable model URLs.
 */

const REMOTE_ROOT_PATH = new URL(REMOTE_TEXTURE_ROOT).pathname;

export function canonicalSourcePath(url) {
	if (!url) return null;
	const parsed = new URL(url, 'http://localhost/');
	if (!isTrustedAwtsmoosMaterialUrl(parsed.href)) return null;
	const relative = decodeURIComponent(parsed.pathname.slice(REMOTE_ROOT_PATH.length));
	return relative ? `/${relative}` : null;
}

export function assertLocalMaterialUrl(assert, url, expectedSource = null) {
	assert.equal(isTrustedAwtsmoosMaterialUrl(url), true, url);
	const source = canonicalSourcePath(url);
	assert.ok(source?.startsWith('/'));
	if (expectedSource) assert.equal(source, expectedSource);
}

export function assertPhotographicMaterialUrl(assert, url, expectedSource = null) {
	assertLocalMaterialUrl(assert, url, expectedSource);
	assert.match(new URL(url).pathname, /\.(?:jpg|jpeg|png|svg)$/i);
}

export function assertGeneratedMaterialUrl(assert, url, expectedSource = null) {
	assertLocalMaterialUrl(assert, url, expectedSource);
}

export function assertLocalFlowerUrl(assert, url, expectedSource) {
	assert.equal(isTrustedRemoteModelUrl(url), true, url);
	assert.equal(url, remoteModelUrl('reference-world/Flower_4_Clump.glb'));
	assert.match(expectedSource, /^\/awtsmoos-nature\/chai-forest\/models\/flower_[a-z]+\.glb$/);
}

export function assertUrlFileExists(assert, parsedUrl) {
	assert.equal(parsedUrl.protocol, 'https:');
}
