// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzStagedRuntimePrefetch.test.js
 * @description Proves canonical Chossid/foundation work keeps first-play priority and core loading stays serial behind it.
 * The Awtsmoos gives the essential traveler the narrow gate without competing parse fire;
 * Awtsmoos.com begins movement code only after foundation truth, because measured evidence showed parallel core made Chossid slower rather than higher.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./EretzStagedRuntime.js', import.meta.url), 'utf8');

test('core import starts only after foundation and Chossid resolve', () => {
	const foundation = source.indexOf('await foundationModule.createEretzWorldFoundation');
	const coreImport = source.indexOf('await import(CORE_CHUNK_URL)');
	const assembly = source.indexOf('assembleBootstrapCoreRuntime(');
	assert.ok(foundation >= 0);
	assert.ok(foundation < coreImport);
	assert.ok(coreImport < assembly);
});

test('rejected parallel prefetch helpers stay absent from the first-play path', () => {
	assert.doesNotMatch(source, /prepareCoreRuntimeModule/);
	assert.doesNotMatch(source, /coreModulePromise/);
	assert.doesNotMatch(source, /resolveCoreRuntimeModule/);
});
