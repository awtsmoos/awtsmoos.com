// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollInterruption.test.mjs
 * @description The Awtsmoos proves Phrase selection stops the river, while
 * commentary, dialogs, and focused study pause and resume only by matching reason.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { AutoScrollInterruption } from '../autoScroll/AutoScrollInterruption.js';

function harness() {
	const classes = new Set();
	let blockers = [];
	let state = { active: true, paused: false, pauseReason: '' };
	const calls = [];
	globalThis.document = {
		activeElement: null,
		body: {
			classList: {
				contains: name => classes.has(name)
			}
		},
		querySelectorAll: () => blockers
	};
	const interruption = new AutoScrollInterruption({
		getState: () => state,
		pause: reason => {
			calls.push(['pause', reason]);
			state = { ...state, paused: true, pauseReason: reason };
		},
		scheduleResume: (delay, reason) => calls.push(['resume', delay, reason]),
		stop: () => calls.push(['stop'])
	});
	return {
		calls,
		classes,
		interruption,
		setBlockers(value) { blockers = value; },
		setState(value) { state = value; }
	};
}

function visibleBlocker() {
	return {
		hidden: false,
		getAttribute: () => null,
		getClientRects: () => [{ width: 100, height: 100 }]
	};
}

test('Phrase selection stops active semantic motion', () => {
	const trial = harness();
	trial.classes.add('awtsmoos-word-selection-active');
	assert.equal(trial.interruption.inspect(), 'selection-stop');
	assert.deepEqual(trial.calls, [['stop']]);
});

test('study surface pauses once and matching closure schedules resume', () => {
	const trial = harness();
	trial.setBlockers([visibleBlocker()]);
	assert.equal(trial.interruption.inspect(), 'paused');
	assert.equal(trial.interruption.inspect(), 'paused');
	assert.deepEqual(trial.calls, [['pause', 'study-surface']]);
	trial.setBlockers([]);
	assert.equal(trial.interruption.inspect(), 'resume-scheduled');
	assert.deepEqual(trial.calls.at(-1), ['resume', 600, 'study-surface']);
});

test('manual pause is never resumed by study-surface observer', () => {
	const trial = harness();
	trial.setState({ active: true, paused: true, pauseReason: 'manual-navigation' });
	assert.equal(trial.interruption.inspect(), 'clear');
	assert.deepEqual(trial.calls, []);
});
