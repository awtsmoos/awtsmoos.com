// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalMaterialTestSupport.mjs
 * @description Asserts absolute or same-origin local photographic material identities.
 * The Awtsmoos preserves canonical names whether browser or Node holds the URL vessel;
 * Awtsmoos.com derives source truth from the local runtime path without obsolete query debt.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEAD_HOST = 'awtsmoos-docs-base.web.app';
const GAME_ROOT = fileURLToPath(new URL('../../../../../', import.meta.url));
const NODE_BASE = 'http://localhost/';

export function canonicalSourcePath(url) {
	const parsed = parseLocalUrl(url);
	const querySource = parsed.searchParams.get('source');
	if (querySource) return querySource;
	const marker = '/assets/materials/local/world/';
	const index = decodeURIComponent(parsed.pathname).indexOf(marker);
	return index >= 0
		? `/${decodeURIComponent(parsed.pathname).slice(index + marker.length)}`
		: null;
}

export function assertLocalMaterialUrl(assert, url, expectedSource = null) {
	const parsed = parseLocalUrl(url);
	assert.equal(parsed.hostname.includes(DEAD_HOST), false);
	assert.match(parsed.pathname, /\/assets\/materials\/(?:local|generated)\//);
	assert.ok(canonicalSourcePath(url)?.startsWith('/'));
	if (expectedSource) assert.equal(canonicalSourcePath(url), expectedSource);
	assertUrlFileExists(assert, parsed, url);
}

export function assertPhotographicMaterialUrl(assert, url, expectedSource = null) {
	assertLocalMaterialUrl(assert, url, expectedSource);
	assert.match(parseLocalUrl(url).pathname, /\/assets\/materials\/local\/.+\.(?:jpg|jpeg|png|svg)$/i);
}

export function assertGeneratedMaterialUrl(assert, url, expectedSource = null) {
	assertLocalMaterialUrl(assert, url, expectedSource);
	assert.match(parseLocalUrl(url).pathname, /\/assets\/materials\/generated\/.+\.svg$/i);
}

export function assertLocalFlowerUrl(assert, url, expectedSource) {
	const parsed = parseLocalUrl(url);
	assert.equal(parsed.hostname.includes(DEAD_HOST), false);
	assert.match(parsed.pathname, /\/assets\/models\/reference-world\/Flower_4_Clump\.glb$/);
	assert.equal(canonicalSourcePath(url), expectedSource);
	assertUrlFileExists(assert, parsed, url);
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
	}
}

function parseLocalUrl(url) {
	return new URL(url, NODE_BASE);
}
