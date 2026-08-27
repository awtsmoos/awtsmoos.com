// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createLaunchPaintTask,
	runMainMenuLaunch
} from '../../launcher/MainMenuLaunchTask.js';

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
	assert.equal(scheduled[0].milliseconds, 0);
	scheduled[0].callback();
	assert.equal(await launch, 'entered');
	assert.equal(handlerCalls, 1);
});

test('paint task remains absent in a non-browser test runtime', () => {
	assert.equal(createLaunchPaintTask({ environment: {} }), null);
});

test('launch task rejects a stalled handler at its finite deadline', async () => {
	const scheduled = [];
	const launch = runMainMenuLaunch(() => new Promise(() => {}), {}, {
		cancelSchedule() {},
		schedule(callback) {
			scheduled.push(callback);
			return 1;
		},
		timeoutMs: 25
	});
	assert.equal(scheduled.length, 1);
	scheduled[0]();
	await assert.rejects(launch, error => error.code === 'WORLD_ENTRY_TIMEOUT');
});
