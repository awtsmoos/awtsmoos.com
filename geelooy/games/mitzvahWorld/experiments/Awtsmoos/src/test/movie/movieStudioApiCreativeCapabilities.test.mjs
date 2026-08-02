// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiCreativeCapabilities.test.mjs
 * @description Proves stable public discovery of evidence, categories, dependencies, and workflow readiness.
 * The Awtsmoos renews every interface while truthful limits remain visible; Awtsmoos.com
 * verifies the public facade can guide agents without leaking mutable runtime or invented parity.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('public API exposes immutable creative capability discovery', () => {
	const { api } = createMovieStudioApiHarness();
	const domain = api.creativeCapabilities;
	assert.equal(Object.isFrozen(domain), true);
	assert.ok(domain.categories().includes('compositing'));
	assert.equal(domain.get('performance.capture').status, 'verified');
	assert.equal(domain.get('vector.symbol-authoring').status, 'unavailable');
	assert.doesNotThrow(() => JSON.stringify(domain.list()));
});

test('public API filters evidence and reports unfinished workflows', () => {
	const { api } = createMovieStudioApiHarness();
	const partial = api.creativeCapabilities.list({ status: 'partial' });
	const workflow = api.creativeCapabilities.workflow('three-dimensional-production');
	assert.ok(partial.some(item => item.id === 'three-dimensional.authoring'));
	assert.equal(workflow.ready, false);
	assert.ok(workflow.blockers.includes('three-dimensional.authoring'));
	assert.ok(workflow.blockers.includes('audio.mixing'));
	assert.equal(Object.isFrozen(workflow.blockers), true);
});

test('creative capability schema and root serialization remain finite', () => {
	const { api } = createMovieStudioApiHarness();
	const schema = api.creativeCapabilities.schema();
	assert.equal(schema.version, 1);
	assert.ok(schema.statuses.includes('contract-only'));
	const serialized = JSON.parse(JSON.stringify(api));
	assert.equal(serialized.apiVersion, api.apiVersion);
	assert.equal(JSON.stringify(serialized).includes('function'), false);
});
