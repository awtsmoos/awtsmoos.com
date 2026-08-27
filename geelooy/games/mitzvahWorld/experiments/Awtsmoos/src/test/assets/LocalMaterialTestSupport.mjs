// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalMaterialTestSupport.mjs
 * @description Verifies trusted Drive textures, generated fallbacks, and remote world models.
 * The Awtsmoos preserves canonical names through local and remote garments; Awtsmoos.com
 * keeps production pigment on Drive while generated fallback vessels remain visibly distinct.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	isTrustedRemoteModelUrl,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';
import {
	isTrustedAwtsmoosMaterialUrl,
	REMOTE_TEXTURE_ROOT
} from '../../assets/RemoteTextureTransport.js';

const GAME_ROOT = fileURLToPath(new URL('../../../../../', import.meta.url));
const REMOTE_ROOT_PATH = new URL(REMOTE_TEXTURE_ROOT).pathname;
const NODE_BASE = 'http://localhost/';

export function canonicalSourcePath(url) {
	if (!url) return null;
	const parsed = new URL(url, NODE_BASE);
	const querySource = parsed.searchParams.get('source');
	if (querySource) return querySource;
	const pathname = decodeURIComponent(parsed.pathname);
	if (isTrustedAwtsmoosMaterialUrl(parsed.href)) {
		const relative = pathname.slice(REMOTE_ROOT_PATH.length);
		return relative ? `/${relative}` : null;
	}
	for (const marker of ['/assets/materials/local/', '/assets/materials/generated/']) {
		const index = pathname.indexOf(marker);
		if (index >= 0) return `/${pathname.slice(index + marker.length)}`;
	}
	return null;
}

export function assertLocalMaterialUrl(assert, url, expectedSource = null) {
	const parsed = new URL(url, NODE_BASE);
	const trusted = isTrustedAwtsmoosMaterialUrl(parsed.href);
	const fallback = /\/assets\/materials\/(?:local|generated)\//.test(parsed.pathname);
	assert.equal(trusted || fallback, true, url);
	const source = canonicalSourcePath(url);
	assert.ok(source?.startsWith('/'));
	if (expectedSource) assert.equal(source, expectedSource);
	if (fallback) assertUrlFileExists(assert, parsed, url);
}

export function assertPhotographicMaterialUrl(assert, url, expectedSource = null) {
	assertLocalMaterialUrl(assert, url, expectedSource);
	assert.match(new URL(url, NODE_BASE).pathname, /\.(?:jpg|jpeg|png|svg)$/i);
}

export function assertGeneratedMaterialUrl(assert, url, expectedSource = null) {
	assertLocalMaterialUrl(assert, url, expectedSource);
	assert.match(new URL(url, NODE_BASE).pathname, /\/assets\/materials\/generated\/.+\.svg$/i);
}

export function assertLocalFlowerUrl(assert, url, expectedSource) {
	assert.equal(isTrustedRemoteModelUrl(url), true, url);
	assert.equal(url, remoteModelUrl('reference-world/Flower_4_Clump.glb'));
	assert.match(expectedSource, /^\/awtsmoos-nature\/chai-forest\/models\/flower_[a-z]+\.glb$/);
}

export function assertUrlFileExists(assert, parsedUrl, originalUrl = parsedUrl.href) {
	if (parsedUrl.protocol === 'file:') {
		const withoutQuery = new URL(parsedUrl.href);
		withoutQuery.search = '';
		assert.equal(fs.existsSync(fileURLToPath(withoutQuery)), true, withoutQuery.href);
		return;
	}
	if (/^\.\//.test(originalUrl)) {
		const relative = decodeURIComponent(originalUrl.replace(/^\.\//, '').split('?')[0]);
		assert.equal(fs.existsSync(path.join(GAME_ROOT, relative)), true, relative);
		return;
	}
	assert.equal(parsedUrl.protocol, 'https:');
}
