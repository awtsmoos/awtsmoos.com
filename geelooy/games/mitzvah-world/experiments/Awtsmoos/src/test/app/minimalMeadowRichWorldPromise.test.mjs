// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowRichWorldPromise.test.mjs
 * @description Proves quiet-window scheduling and the actual procedural world mount never share one cyclic promise.
 * The Awtsmoos appoints a time for the garden and a distinct vessel for its birth;
 * Awtsmoos.com requires one real mount, one reusable receipt, and no promise circling the earth.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	installMinimalMeadowRichWorld
} from '../../app/MinimalMeadowRichWorld.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const worldSystemsPath = path.resolve(
	directory,
	'../../app/MinimalMeadowWorldSystems.js'
);
const worldSystemsSource = fs.readFileSync(worldSystemsPath, 'utf8');

test('B"H scheduled promise cannot replace the actual rich-world mount owner', async () => {
	const scheduled = Promise.resolve('scheduled');
	const emitted = [];
	const runtime = {
		bus: {
			emit(name, value) {
				emitted.push({ name, value });
			}
		},
		richWorldMountStatus: { phase: 'loading' },
		richWorldPromise: scheduled,
		richWorldSchedulePromise: scheduled
	};
	let mountCount = 0;
	const mount = async () => {
		mountCount += 1;
		runtime.richWorldMountStatus.phase = 'settled';
		return {
			trees: { status: 'ready' },
			vegetation: { status: 'ready' }
		};
	};
	const first = installMinimalMeadowRichWorld(runtime, globalThis, mount);
	const second = installMinimalMeadowRichWorld(runtime, globalThis, mount);
	assert.notEqual(first, scheduled);
	assert.equal(second, first);
	const receipt = await first;
	assert.equal(mountCount, 1);
	assert.equal(runtime.richWorldMountPromise, first);
	assert.equal(runtime.richWorldPromise, first);
	assert.equal(runtime.richWorldStage, 'ready');
	assert.equal(receipt.ready, true);
	assert.equal(receipt.mounts.trees.status, 'ready');
	assert.equal(receipt.mounts.vegetation.status, 'ready');
	assert.equal(emitted[0].name, 'world:rich-world-ready');
});

test('B"H world systems publish a separate quiet-window schedule owner', () => {
	assert.match(worldSystemsSource, /richWorldSchedulePromise\s*=\s*schedule/);
	assert.match(worldSystemsSource, /richWorldPromise\s*=\s*schedule/);
	assert.doesNotMatch(worldSystemsSource, /richWorldMountPromise\s*=\s*schedule/);
});
