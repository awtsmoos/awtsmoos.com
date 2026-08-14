// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollPause.test.mjs
 * @description The Awtsmoos proves quiet resume-timer bookkeeping cannot echo
 * through Awtsmoos.com UI observers before the intended human-study rest ends.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { AutoScrollPause } from '../autoScroll/AutoScrollPause.js';

function createHarness() {
	const updates = [];
	const runtimeCalls = [];
	const state = {
		value: {
			active: true,
			paused: true,
			pauseReason: 'study-surface',
			resumeTimer: 0
		},
		clearResumeTimer() {
			if (this.value.resumeTimer) {
				clearTimeout(this.value.resumeTimer);
			}
			this.value.resumeTimer = 0;
		},
		update(patch, shouldEmit = true) {
			this.value = { ...this.value, ...patch };
			updates.push({ patch, shouldEmit });
		}
	};
	const runtime = {
		pause: () => runtimeCalls.push('pause'),
		resume: () => runtimeCalls.push('resume')
	};
	return {
		pause: new AutoScrollPause(state, runtime),
		runtimeCalls,
		state,
		updates
	};
}

test('resume timer bookkeeping is silent until resume changes visible state', async () => {
	const trial = createHarness();
	assert.equal(trial.pause.scheduleResume(15, 'study-surface'), true);
	assert.equal(trial.updates.length, 1);
	assert.equal(trial.updates[0].shouldEmit, false);
	assert.ok(trial.updates[0].patch.resumeTimer);
	await new Promise(resolve => setTimeout(resolve, 35));
	assert.deepEqual(trial.runtimeCalls, ['resume']);
	assert.equal(trial.state.value.paused, false);
	assert.equal(trial.state.value.pauseReason, '');
	assert.equal(trial.updates.at(-1).shouldEmit, true);
});

test('mismatched pause reason never resumes motion', () => {
	const trial = createHarness();
	assert.equal(trial.pause.resume('manual'), false);
	assert.deepEqual(trial.runtimeCalls, []);
	assert.equal(trial.state.value.paused, true);
});
