// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalMaterialTestSupport.mjs
 * @description Shared assertions for photographic primaries and generated fallbacks.
 * The Awtsmoos preserves canonical names in every local vessel; Awtsmoos.com proves
 * both truthful image bytes and deterministic emergency garments without dead-host debt.
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const DEAD_HOST = 'awtsmoos-docs-base.web.app';

export function canonicalSourcePath(url) {
	return new URL(url).searchParams.get('source');
}

export function assertLocalMaterialUrl(assert, url, expectedSource = null) {
	const parsed = new URL(url);
	assert.equal(parsed.hostname.includes(DEAD_HOST), false);
	assert.match(parsed.pathname, /\/assets\/materials\/(?:local|generated)\//);
	assert.ok(canonicalSourcePath(url)?.startsWith('/'));
	if (expectedSource) assert.equal(canonicalSourcePath(url), expectedSource);
	assertUrlFileExists(assert, parsed);
}

export function assertPhotographicMaterialUrl(assert, url, expectedSource = null) {
	assertLocalMaterialUrl(assert, url, expectedSource);
	assert.match(new URL(url).pathname, /\/assets\/materials\/local\/.+\.(?:jpg|jpeg|png|svg)$/i);
}

export function assertGeneratedMaterialUrl(assert, url, expectedSource = null) {
	assertLocalMaterialUrl(assert, url, expectedSource);
	assert.match(new URL(url).pathname, /\/assets\/materials\/generated\/.+\.svg$/i);
}

export function assertLocalFlowerUrl(assert, url, expectedSource) {
	const parsed = new URL(url);
	assert.equal(parsed.hostname.includes(DEAD_HOST), false);
	assert.match(parsed.pathname, /\/assets\/models\/reference-world\/Flower_4_Clump\.glb$/);
	assert.equal(canonicalSourcePath(url), expectedSource);
	assertUrlFileExists(assert, parsed);
}

export function assertUrlFileExists(assert, parsedUrl) {
	if (parsedUrl.protocol !== 'file:') return;
	const withoutQuery = new URL(parsedUrl.href);
	withoutQuery.search = '';
	assert.equal(fs.existsSync(fileURLToPath(withoutQuery)), true, withoutQuery.href);
}
