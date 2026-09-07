// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuLaunchTask.test.mjs
 * @description Proves the world-entry covenant resolves, times out finitely, and preserves exact stage/URL evidence through every failure path.
 * The Awtsmoos gives every test a boundary where truth may shine; Awtsmoos.com asks failure to name its doorway,
 * so neither a stalled promise nor a rejected import can hide the road whose finite vessel failed in time.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createLaunchPaintTask,
	runMainMenuLaunch
} from '../../launcher/MainMenuLaunchTask.js';

const EVIDENCE = Object.freeze({
	message: 'Opening playable meadow…',
	progress: 0.72,
	stage: 'bootstrap-visible-world',
	url: './BootstrapWorldFoundation.js?v=recovery-test'
});

test('launch task forwards progress and resolves the selected handler', async () => {
	const progress = [];
	const result = await runMainMenuLaunch(async selection => {
		selection.onProgress('terrain');
		return 'ready';
	}, { onProgress: value => progress.push(value) }, { timeoutMs: 0 });
	assert.equal(result, 'ready');
	assert.deepEqual(progress, ['terrain']);
});

test('browser paint gate uses one timer and never requestAnimationFrame', async () => {
	const scheduled = [];
	let handlerCalls = 0;
	const environment = {
		document: {},
		requestAnimationFrame() {
			throw new Error('Animation frames must not gate world entry.');
		},
		setTimeout(callback, milliseconds) {
			scheduled.push({ callback, milliseconds });
			return scheduled.length;
		}
	};
	const launch = runMainMenuLaunch(() => {
		handlerCalls += 1;
		return 'entered';
	}, {}, { environment, timeoutMs: 0 });
	assert.equal(handlerCalls, 0);
	assert.equal(scheduled.length, 1);
	scheduled[0].callback();
	assert.equal(await launch, 'entered');
	assert.equal(handlerCalls, 1);
});

test('paint task remains absent in a non-browser test runtime', () => {
	assert.equal(createLaunchPaintTask({ environment: {} }), null);
});

test('stalled launch reports the last exact stage and URL at its finite deadline', async () => {
	const scheduled = [];
	const launch = runMainMenuLaunch(selection => {
		selection.onProgress(EVIDENCE);
		return new Promise(() => {});
	}, {}, {
		cancelSchedule() {},
		schedule(callback) {
			scheduled.push(callback);
			return 1;
		},
		timeoutMs: 25
	});
	await Promise.resolve();
	assert.equal(scheduled.length, 1);
	scheduled[0]();
	await assert.rejects(launch, error => {
		assert.equal(error.code, 'WORLD_ENTRY_TIMEOUT');
		assert.equal(error.launchStage, EVIDENCE.stage);
		assert.equal(error.launchUrl, EVIDENCE.url);
		assert.match(error.message, /bootstrap-visible-world/);
		assert.match(error.message, /BootstrapWorldFoundation/);
		return true;
	});
});

test('immediate launch rejection preserves the most recent stage and URL', async () => {
	const launch = runMainMenuLaunch(selection => {
		selection.onProgress(EVIDENCE);
		throw new Error('Import failed');
	}, {}, { timeoutMs: 0 });
	await assert.rejects(launch, error => {
		assert.equal(error.launchStage, EVIDENCE.stage);
		assert.equal(error.launchUrl, EVIDENCE.url);
		assert.match(error.message, /Import failed/);
		assert.match(error.message, /BootstrapWorldFoundation/);
		return true;
	});
});
