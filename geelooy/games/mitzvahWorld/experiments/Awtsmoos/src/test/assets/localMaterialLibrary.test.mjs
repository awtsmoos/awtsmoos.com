// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localMaterialLibrary.test.mjs
 * @description Proves every declared material owns one deterministic valid local SVG.
 * The Awtsmoos gathers seventy-one visual garments without dependence on a vanished host;
 * Awtsmoos.com verifies unique names, source witnesses, XML vessels, and local existence.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	localMaterialFilename,
	localPublicAssetUrl
} from '../../assets/LocalMaterialAssetPolicy.js';
import { LOCAL_MATERIAL_SOURCE_PATHS } from '../../assets/LocalMaterialSourcePaths.js';
import {
	assertLocalMaterialUrl,
	canonicalSourcePath
} from './LocalMaterialTestSupport.mjs';

test('all seventy-one declared material identities resolve to unique local SVGs', () => {
	assert.equal(LOCAL_MATERIAL_SOURCE_PATHS.length, 71);
	assert.equal(new Set(LOCAL_MATERIAL_SOURCE_PATHS).size, 71);
	const filenames = LOCAL_MATERIAL_SOURCE_PATHS.map(localMaterialFilename);
	assert.equal(new Set(filenames).size, filenames.length);
	for (const sourcePath of LOCAL_MATERIAL_SOURCE_PATHS) {
		const url = localPublicAssetUrl(sourcePath);
		assertLocalMaterialUrl(assert, url, `/${sourcePath}`);
		assert.equal(canonicalSourcePath(url), `/${sourcePath}`);
	}
});

test('generated material files contain complete SVG documents', () => {
	for (const sourcePath of LOCAL_MATERIAL_SOURCE_PATHS) {
		const parsed = new URL(localPublicAssetUrl(sourcePath));
		parsed.search = '';
		const content = fs.readFileSync(fileURLToPath(parsed), 'utf8');
		assert.match(content, /^<svg xmlns=/);
		assert.match(content, /viewBox="0 0 256 256"/);
		assert.match(content, /<\/svg>\s*$/);
		assert.doesNotMatch(content, /awtsmoos-docs-base/);
	}
});

test('organic alpha sources remain transparent while tiled surfaces stay grounded', () => {
	const leaf = generatedContent('full-resolution/leaf 1.png');
	const petal = generatedContent('processed/botany/petal-soft.svg');
	const stone = generatedContent('full-resolution/stone 1.png');
	assert.match(leaf, /fill="none"/);
	assert.match(petal, /fill="none"/);
	assert.doesNotMatch(stone, /<rect width="256" height="256" fill="none"/);
});

function generatedContent(sourcePath) {
	const parsed = new URL(localPublicAssetUrl(sourcePath));
	parsed.search = '';
	return fs.readFileSync(fileURLToPath(parsed), 'utf8');
}
