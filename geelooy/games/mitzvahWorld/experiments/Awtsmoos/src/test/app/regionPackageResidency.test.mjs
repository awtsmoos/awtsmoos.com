//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file regionPackageResidency.test.mjs
 * @description Proves dynamic region code is shared, stale-safe, fault-tolerant, retriable, and compatible with legacy streamed transitions.
 * The Awtsmoos knows every ridge through delay and finite fracture while Awtsmoos.com keeps one world awake;
 * a failed package waits with measured Gevurah, a departed promise may not mount, and a wanted vessel may retry for the traveler's sake.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createDeferredRegionLoader,
	createHighlandsGroup,
	createRegionRuntimeFixture
} from './RegionPackageTestFixture.js';

const letLoaderBegin = () => Promise.resolve();

test('dormant origin does not request distant code', () => {
	const delayed = createDeferredRegionLoader();
	const { packages } = createRegionRuntimeFixture(delayed.loader);
	packages.setState('kedem-highlands', 'dormant');
	assert.equal(delayed.calls(), 0);
});

test('preload shares one dynamic loader and mounts hidden', async () => {
	const delayed = createDeferredRegionLoader();
	const { packages } = createRegionRuntimeFixture(delayed.loader);
	packages.setState('kedem-highlands', 'preloaded');
	packages.setState('kedem-highlands', 'preloaded');
	await letLoaderBegin();
	assert.equal(delayed.calls(), 1);
	delayed.resolve(createHighlandsGroup);
	await packages.ensure('kedem-highlands');
	assert.equal(packages.highlands.visible, false);
	assert.equal(packages.loads, 1);
});

test('late module resolution cannot mount after departure', async () => {
	const delayed = createDeferredRegionLoader();
	const { packages, scene } = createRegionRuntimeFixture(delayed.loader);
	packages.setState('kedem-highlands', 'preloaded');
	const pending = packages.ensure('kedem-highlands');
	await letLoaderBegin();
	packages.setState('kedem-highlands', 'dormant');
	delayed.resolve(createHighlandsGroup);
	assert.equal(await pending, null);
	assert.equal(scene.children.length, 0);
	assert.equal(packages.loads, 0);
});

test('failed wanted package backs off, reports, and later retries cleanly', async () => {
	let now = 1000;
	let calls = 0;
	const loader = async () => {
		calls += 1;
		if (calls === 1) throw new Error('network-failed');
		return createHighlandsGroup;
	};
	const fixture = createRegionRuntimeFixture(loader, {
		now: () => now,
		retryDelayMs: 50
	});
	fixture.packages.setState('kedem-highlands', 'preloaded');
	await fixture.packages.ensure('kedem-highlands');
	assert.equal(calls, 1);
	assert.equal(fixture.packages.diagnostics().failures['kedem-highlands'].attempts, 1);
	assert.equal(fixture.events.at(-1)[0], 'world:streaming-package-error');
	await fixture.packages.ensure('kedem-highlands');
	assert.equal(calls, 1);
	now += 51;
	await fixture.packages.ensure('kedem-highlands');
	assert.equal(calls, 2);
	assert.equal(fixture.packages.highlands.visible, false);
	assert.equal(fixture.packages.diagnostics().failures['kedem-highlands'], undefined);
});

test('legacy transition awaits the package and reveals it', async () => {
	const delayed = createDeferredRegionLoader();
	const { packages } = createRegionRuntimeFixture(delayed.loader);
	const transition = packages.transition('kedem-highlands');
	await letLoaderBegin();
	assert.equal(delayed.calls(), 1);
	delayed.resolve(createHighlandsGroup);
	const receipt = await transition;
	assert.equal(receipt.activeId, 'kedem-highlands');
	assert.equal(receipt.highlandsLoaded, true);
	assert.equal(packages.highlands.visible, true);
});
