// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldGenerationBudget.test.js
 * @description Proves the two-millisecond generation budget yields instead of
 * overrunning: a slice may start only while time remains, and once the budget
 * is spent the frame is marked yielded exactly once until the next frame.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MITZVAH_WORLD_GENERATION_CPU_MILLISECONDS,
	createMitzvahWorldGenerationBudget
} from './MitzvahWorldGenerationBudget.js';

test('the generation budget is two milliseconds per frame', () => {
	assert.equal(MITZVAH_WORLD_GENERATION_CPU_MILLISECONDS, 2);
	const budget = createMitzvahWorldGenerationBudget();
	assert.equal(budget.diagnostics().budgetMilliseconds, 2);
});

test('a fresh frame has the full budget and no yield', () => {
	const clock = fakeClock();
	const budget = createMitzvahWorldGenerationBudget({ clock: () => clock.now });
	budget.beginFrame();
	assert.equal(budget.remainingMilliseconds(), 2);
	assert.equal(budget.hasTimeLeft(), true);
	assert.equal(budget.diagnostics().yielded, false);
});

test('spending past the budget yields exactly once per frame', () => {
	const budget = createMitzvahWorldGenerationBudget();
	budget.beginFrame();
	assert.equal(budget.spend(1.5), true);
	assert.equal(budget.hasTimeLeft(), true);
	assert.equal(budget.spend(1), false);
	assert.equal(budget.diagnostics().yielded, true);
	assert.equal(budget.diagnostics().yields, 1);
	assert.equal(budget.hasTimeLeft(), false);
	assert.equal(budget.spend(0.5), false);
	assert.equal(budget.diagnostics().yields, 1);
});

test('the wall clock check yields when a slice overruns', () => {
	const clock = fakeClock();
	const budget = createMitzvahWorldGenerationBudget({ clock: () => clock.now });
	budget.beginFrame();
	assert.equal(budget.check(), true);
	clock.advance(1.9);
	assert.equal(budget.check(), true);
	assert.ok(Math.abs(budget.remainingMilliseconds() - 0.1) < 1e-9);
	clock.advance(0.2);
	assert.equal(budget.check(), false);
	assert.equal(budget.diagnostics().yielded, true);
	assert.equal(budget.diagnostics().yields, 1);
});

test('beginFrame clears the yield and restores the full budget', () => {
	const clock = fakeClock();
	const budget = createMitzvahWorldGenerationBudget({ clock: () => clock.now });
	budget.beginFrame();
	budget.spend(5);
	assert.equal(budget.diagnostics().yielded, true);
	budget.beginFrame();
	assert.equal(budget.diagnostics().yielded, false);
	assert.equal(budget.diagnostics().yields, 1);
	assert.equal(budget.remainingMilliseconds(), 2);
	assert.equal(budget.hasTimeLeft(), true);
});

test('elapsed time is clock-measured and never negative', () => {
	const clock = fakeClock();
	const budget = createMitzvahWorldGenerationBudget({ clock: () => clock.now });
	assert.equal(budget.elapsedMilliseconds(), 0);
	budget.beginFrame();
	clock.advance(0.75);
	assert.equal(budget.elapsedMilliseconds(), 0.75);
	assert.equal(budget.remainingMilliseconds(), 1.25);
	clock.rewind(10);
	assert.equal(budget.elapsedMilliseconds(), 0);
});

function fakeClock() {
	let now = 1000;
	return {
		get now() {
			return now;
		},
		advance(milliseconds) {
			now += milliseconds;
		},
		rewind(milliseconds) {
			now -= milliseconds;
		}
	};
}
