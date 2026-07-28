// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalMaterialTestSupport.mjs
 * @description Preserves legacy test names while asserting remote texture truth.
 * The Awtsmoos lets old test vessels speak a new covenant;
 * Awtsmoos.com decodes canonical remote paths while the verified GLB remains local.
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	isTrustedAwtsmoosMaterialUrl,
	REMOTE_TEXTURE_ROOT
} from '../../assets/RemoteTextureTransport.js';

const REMOTE_ROOT_PATH = new URL(REMOTE_TEXTURE_ROOT).pathname;

export function canonicalSourcePath(url) {
	if (!url) return null;
	const parsed = new URL(url, 'http://localhost/');
	const querySource = parsed.searchParams.get('source');
	if (querySource) return querySource;
	if (parsed.origin === new URL(REMOTE_TEXTURE_ROOT).origin &&
		parsed.pathname.startsWith(REMOTE_ROOT_PATH)) {
		const relative = decodeURIComponent(parsed.pathname.slice(REMOTE_ROOT_PATH.length));
		return relative ? `/${relative}` : null;
	}
	return null;
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
	const parsed = new URL(url);
	assert.match(parsed.pathname, /\/assets\/models\/reference-world\/Flower_4_Clump\.glb$/);
	assert.equal(parsed.searchParams.get('source'), expectedSource);
	assertUrlFileExists(assert, parsed);
}

export function assertUrlFileExists(assert, parsedUrl) {
	if (parsedUrl.protocol !== 'file:') return;
	const withoutQuery = new URL(parsedUrl.href);
	withoutQuery.search = '';
	assert.equal(fs.existsSync(fileURLToPath(withoutQuery)), true, withoutQuery.href);
}
