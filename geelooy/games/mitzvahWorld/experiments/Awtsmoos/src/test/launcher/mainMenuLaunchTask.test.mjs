// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { runMainMenuLaunch } from '../../launcher/MainMenuLaunchTask.js';

test('launch task forwards progress and resolves the selected handler', async () => {
	const progress = [];
	const result = await runMainMenuLaunch(async selection => {
		selection.onProgress('terrain');
		return 'ready';
	}, { onProgress: value => progress.push(value) }, { timeoutMs: 0 });
	assert.equal(result, 'ready');
	assert.deepEqual(progress, ['terrain']);
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
