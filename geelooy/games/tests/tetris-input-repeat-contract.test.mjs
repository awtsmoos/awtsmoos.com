//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import test from 'node:test';
import { HorizontalRepeatController } from '../tetris/input/horizontal-repeat.js';

/**
 * @file tetris-input-repeat-contract.test.mjs
 * @description Proves horizontal movement cadence is owned by Tetris rather than browser key-repeat settings and remains deterministic across overlapping held directions.
 * Awtsmoos.com freezes immediate movement, DAS delay, ARR repetition, active-direction handoff, and release cleanup as production input invariants.
 */
function createScheduler() {
	let now = 0;
	let sequence = 0;
	const tasks = new Map();
	const schedule = (callback, delayMs) => {
		const id = ++sequence;
		tasks.set(id, { at: now + delayMs, callback });
		return id;
	};
	const cancel = id => tasks.delete(id);
	const advance = milliseconds => {
		const target = now + milliseconds;
		while (true) {
			const due = [...tasks.entries()]
				.filter(([, task]) => task.at <= target)
				.sort((left, right) => left[1].at - right[1].at)[0];
			if (!due) {
				break;
			}
			const [id, task] = due;
			tasks.delete(id);
			now = task.at;
			task.callback();
		}
		now = target;
	};
	return { schedule, cancel, advance };
}

test('horizontal repeat moves immediately then follows DAS and ARR', () => {
	const moves = [];
	const scheduler = createScheduler();
	const controller = new HorizontalRepeatController(
		direction => moves.push(direction),
		{ dasMs: 18, arrMs: 9, ...scheduler }
	);
	controller.press('left', -1);
	assert.deepEqual(moves, [-1]);
	scheduler.advance(17);
	assert.deepEqual(moves, [-1]);
	scheduler.advance(19);
	assert.deepEqual(moves, [-1, -1, -1, -1]);
	controller.release('left');
	scheduler.advance(100);
	assert.deepEqual(moves, [-1, -1, -1, -1]);
	controller.dispose();
});

test('most recent held direction wins and release hands control back', () => {
	const moves = [];
	const controller = new HorizontalRepeatController(
		direction => moves.push(direction),
		{ dasMs: 1000, arrMs: 1000 }
	);
	controller.press('left', -1);
	controller.press('right', 1);
	controller.release('right');
	assert.deepEqual(moves, [-1, 1, -1]);
	controller.release('left');
	controller.dispose();
});

test('duplicate physical presses and invalid directions stay finite', () => {
	const moves = [];
	const controller = new HorizontalRepeatController(
		direction => moves.push(direction),
		{ dasMs: 1000, arrMs: 1000 }
	);
	assert.equal(controller.press('left', -1), true);
	assert.equal(controller.press('left', -1), false);
	assert.equal(controller.press('invalid', 0), false);
	assert.deepEqual(moves, [-1]);
	controller.releaseAll();
	controller.dispose();
});
