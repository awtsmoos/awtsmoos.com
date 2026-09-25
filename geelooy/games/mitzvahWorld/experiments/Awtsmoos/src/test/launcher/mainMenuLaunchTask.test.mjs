// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuLaunchTask.test.mjs
 * @description Proves world entry resolves, rearms on progress, remains finitely bounded, and preserves exact stage/URL evidence.
 * The Awtsmoos gives slow progress another measured breath without granting infinity; Awtsmoos.com tests the living
 * renewal of the stall gate and the immutable outer horizon so mobile truth is neither killed early nor allowed to vanish forever.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { runMainMenuLaunch } from '../../launcher/MainMenuLaunchTask.js';
import { createLaunchTestClock, deadlineOptions } from './MainMenuLaunchTaskTestClock.mjs';

const EVIDENCE = Object.freeze({
	message: 'Opening playable meadow…', progress: 0.72,
	stage: 'bootstrap-visible-world', url: './BootstrapWorldFoundation.js?v=recovery-test'
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

test('real progress rearms the stall deadline instead of honoring the original wall clock', async () => {
	const clock = createLaunchTestClock();
	let observed = null;
	let release = null;
	const launch = runMainMenuLaunch(selection => {
		observed = selection;
		return new Promise(resolve => { release = resolve; });
	}, {}, deadlineOptions(clock));
	await Promise.resolve();
	const originalStall = clock.only(25);
	observed.onProgress(EVIDENCE);
	assert.equal(clock.has(originalStall), false);
	assert.notEqual(clock.only(25), originalStall);
	release('ready-after-progress');
	assert.equal(await launch, 'ready-after-progress');
	assert.equal(clock.size(), 0);
});

test('a real stall after the latest progress reports exact stage and URL', async () => {
	const clock = createLaunchTestClock();
	const launch = runMainMenuLaunch(selection => {
		selection.onProgress(EVIDENCE);
		return new Promise(() => {});
	}, {}, deadlineOptions(clock));
	await Promise.resolve();
	clock.fire(clock.only(25));
	await assert.rejects(launch, error => {
		assert.equal(error.code, 'WORLD_ENTRY_STALL_TIMEOUT');
		assert.equal(error.launchStage, EVIDENCE.stage);
		assert.equal(error.launchUrl, EVIDENCE.url);
		assert.match(error.message, /no progress/);
		return true;
	});
});

test('hard launch horizon cannot be extended by progress', async () => {
	const clock = createLaunchTestClock();
	let observed = null;
	const launch = runMainMenuLaunch(selection => {
		observed = selection;
		return new Promise(() => {});
	}, {}, deadlineOptions(clock));
	await Promise.resolve();
	observed.onProgress(EVIDENCE);
	observed.onProgress({ ...EVIDENCE, stage: 'bootstrap-core-runtime' });
	clock.fire(clock.only(100));
	await assert.rejects(launch, error => {
		assert.equal(error.code, 'WORLD_ENTRY_HARD_TIMEOUT');
		assert.equal(error.launchStage, 'bootstrap-core-runtime');
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
		return true;
	});
});
