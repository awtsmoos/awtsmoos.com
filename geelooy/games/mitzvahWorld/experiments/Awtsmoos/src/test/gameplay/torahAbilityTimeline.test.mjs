// B"H
// Boruch Hashem
// Blessed is He

/** @file torahAbilityTimeline.test.mjs @description Verifies every supported cast transition. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { TorahAbilityTimeline } from '../../gameplay/combat/TorahAbilityTimeline.js';

test('instant ability commits once and starts cooldown only after acceptance', () => {
	const executions = [];
	const timeline = createTimeline({ execute: (ability, context) => {
		executions.push({ ability, context });
		return true;
	} });
	assert.equal(timeline.activate('grateful-awakening', { now: 0 }).reason, 'complete');
	assert.equal(executions.length, 1);
	assert.equal(timeline.activate('grateful-awakening', { now: 1 }).reason, 'global-cooldown');
	assert.equal(timeline.snapshot(1).diagnostics.executor.accepted, 1);
});

test('cast waits for impact, while interruption cancels without execution', () => {
	const executions = [];
	const timeline = createTimeline({ execute: ability => {
		executions.push(ability.id);
		return true;
	} });
	const context = { distance: 10, now: 0, target: { attackable: true, id: 'shade' } };
	assert.equal(timeline.activate('light-against-concealment', context).reason, 'casting');
	timeline.update(699);
	assert.equal(executions.length, 0);
	timeline.update(700);
	assert.deepEqual(executions, ['light-against-concealment']);

	const interrupted = createTimeline({ execute: ability => executions.push(ability.id) });
	interrupted.activate('light-against-concealment', context);
	assert.equal(interrupted.interrupt('movement'), true);
	interrupted.update(1000);
	assert.equal(executions.length, 1);
	assert.equal(interrupted.snapshot(1000).diagnostics.interrupted, 1);
});

test('charged release carries bounded strength into one accepted execution', () => {
	const contexts = [];
	const timeline = createTimeline({ execute: (ability, context) => {
		contexts.push(context);
		return { ok: true };
	} });
	assert.equal(timeline.activate('joy-breaks-barriers', { now: 0 }).reason, 'charging');
	assert.equal(timeline.release(700).ok, true);
	assert.equal(contexts[0].chargeRatio, 0.5);
	assert.equal(timeline.snapshot(700).cooldowns.abilities[0].charges, 1);
});

test('channel commits once, emits three ticks, and completes on one timeline', () => {
	const ticks = [];
	const events = [];
	const timeline = createTimeline({
		bus: { emit: (type, detail) => events.push({ detail, type }) },
		onChannelTick: (ability, context, tickIndex) => ticks.push({ ability, context, tickIndex })
	});
	const result = timeline.activate('voice-of-unity', {
		distance: 8,
		now: 0,
		target: { attackable: true, id: 'shade' }
	});
	assert.equal(result.reason, 'channeling');
	timeline.update(2400);
	assert.deepEqual(ticks.map(item => item.tickIndex), [1, 2, 3]);
	assert.equal(timeline.snapshot(2400).activeCast, null);
	assert.equal(events.filter(event => event.type === 'torah:cast-complete').length, 1);
});

test('invalid target, range, resource, and executor rejection do not consume cooldown', () => {
	const timeline = createTimeline({ execute: () => ({ ok: false, reason: 'world-rejected' }) });
	assert.equal(timeline.activate('light-against-concealment', { now: 0 }).reason, 'no-target');
	assert.equal(timeline.activate('light-against-concealment', {
		distance: 20,
		now: 0,
		target: { attackable: true, id: 'shade' }
	}).reason, 'out-of-range');
	const exhaustedTimeline = createTimeline({ getResource: () => 0 });
	assert.equal(exhaustedTimeline.activate('shield-of-trust', { now: 0 }).reason, 'insufficient-resource');
	const rejectedTimeline = createTimeline({ execute: () => ({ ok: false, reason: 'world-rejected' }) });
	assert.equal(rejectedTimeline.activate('grateful-awakening', { now: 0 }).reason, 'world-rejected');
	assert.equal(rejectedTimeline.readiness('grateful-awakening', { now: 1 }).ok, true);
});

function createTimeline(overrides = {}) {
	return new TorahAbilityTimeline({
		execute: () => true,
		getResource: () => 100,
		isUnlocked: () => true,
		...overrides
	});
}
