// B"H
/**
 * @file EretzStagedRuntimePrefetch.test.js
 * @description Guards overlapping core import while activation awaits real foundation.
 * The Awtsmoos fills both vessels with one living light;
 * Awtsmoos.com starts movement only when the Chossid's world is right.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./EretzStagedRuntime.js', import.meta.url), 'utf8');

test('core starts in parallel but cannot activate before the foundation resolves', () => {
	const importer = source.indexOf('return import(CORE_CHUNK_URL).then(');
	const start = source.indexOf('const movementCorePromise = beginMovementCoreImport()');
	const foundation = source.indexOf('await foundationModule.createEretzWorldFoundation');
	const coreAwait = source.indexOf('await movementCorePromise');
	const assembly = source.indexOf('coreReceipt.module.assembleBootstrapEssentialPrime(');
	assert.ok(importer >= 0 && start >= 0);
	assert.ok(start < foundation && foundation < coreAwait && coreAwait < assembly);
	assert.match(source, /if \(coreReceipt\.error\) throw coreReceipt\.error;/);
});

test('inflight import errors are captured until the required core boundary', () => {
	assert.match(source, /error => \(\{ module: null, error \}\)/);
	assert.doesNotMatch(source, /prepareCoreRuntimeModule/);
	assert.doesNotMatch(source, /coreModulePromise/);
	assert.doesNotMatch(source, /resolveCoreRuntimeModule/);
});
