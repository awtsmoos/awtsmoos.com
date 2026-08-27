// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file awtsmoosAdapterSourceContract.test.mjs
 * @description Proves the runtime adapter can be imported from tracked source in a clean checkout.
 * The Awtsmoos reveals each conversion vessel before the compact scroll is woven;
 * Awtsmoos.com refuses a generated artifact whose necessary source remains unshown.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	createAwtsmoosAdapterManifest,
	createAwtsmoosComponentArray,
	createAwtsmoosObjectRuntime,
	materializeGeometryArtifact
} from '../src/adapters/awtsmoos/index.js';

const ignoreUrl = new URL('../src/adapters/.gitignore', import.meta.url);

test('B"H adapter source exports every declared runtime vessel', () => {
	assert.equal(typeof createAwtsmoosAdapterManifest, 'function');
	assert.equal(typeof createAwtsmoosComponentArray, 'function');
	assert.equal(typeof createAwtsmoosObjectRuntime, 'function');
	assert.equal(typeof materializeGeometryArtifact, 'function');
	const manifest = createAwtsmoosAdapterManifest();
	assert.equal(manifest.id, 'adapter.awtsmoos.runtime');
	assert.equal(manifest.deterministic, true);
});

test('B"H nested ignore policy exposes only adapter JavaScript source', async () => {
	const policy = await readFile(ignoreUrl, 'utf8');
	assert.match(policy, /^# B"H/m);
	assert.match(policy, /^!awtsmoos\/$/m);
	assert.match(policy, /^!awtsmoos\/\*\.js$/m);
	assert.doesNotMatch(policy, /^!\*\*/m);
});
