// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file torahAbilityTimeline.test.mjs
 * @description Verifies instant, cast, charge, channel, rejection, and concentration transitions.
 * The Awtsmoos renews every cast while a broken future cannot become a projectile;
 * Awtsmoos.com proves partial resistance and terminal interruption remain bounded and legible.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { TorahAbilityTimeline } from '../../gameplay/combat/TorahAbilityTimeline.js';

test('instant ability commits once and cooldown begins after acceptance', () => {
	const executions = [];
	const timeline = createTimeline({
		execute: (ability, context) => acceptInto(executions, { ability, context })
	});
	assert.equal(timeline.activate('grateful-awakening', { now: 0 }).reason, 'complete');
	assert.equal(executions.length, 1);
	assert.equal(timeline.activate('grateful-awakening', { now: 1 }).reason, 'global-cooldown');
	assert.equal(timeline.snapshot(1).diagnostics.executor.accepted, 1);
});

test('cast waits for completion while legacy interruption cancels execution', () => {
	const executions = [];
	const timeline = createTimeline({
		execute: ability => acceptInto(executions, ability.id)
	});
	const context = targetContext();
	assert.equal(timeline.activate('light-against-concealment', context).reason, 'casting');
	timeline.update(699);
	assert.equal(executions.length, 0);
	timeline.update(700);
	assert.deepEqual(executions, ['light-against-concealment']);
	const interrupted = createTimeline({
		execute: ability => acceptInto(executions, ability.id)
	});
	interrupted.activate('light-against-concealment', context);
	assert.equal(interrupted.interrupt('movement'), true);
	interrupted.update(1000);
	assert.equal(executions.length, 1);
	assert.equal(interrupted.snapshot(1000).diagnostics.interrupted, 1);
});

test('partial force depletes concentration and terminal force prevents release', () => {
	const executions = [];
	const events = [];
	const timeline = createTimeline({
		bus: { emit: (type, detail) => events.push({ detail, type }) },
		execute: ability => acceptInto(executions, ability.id)
	});
	timeline.activate('light-against-concealment', targetContext());
	const partial = timeline.receiveInterrupt(0.4, 'projectile-impact', 200);
	assert.equal(partial.interrupted, false);
	assert.equal(partial.resisted, true);
	assert.equal(partial.remaining, 0.6);
	const terminal = timeline.receiveInterrupt(0.6, 'stagger', 300);
	assert.equal(terminal.interrupted, true);
	assert.equal(terminal.remaining, 0);
	timeline.update(1000);
	assert.equal(executions.length, 0);
	assert.equal(events.some(event => event.type === 'torah:cast-complete'), false);
	assert.equal(timeline.snapshot(1000).diagnostics.interruptResisted, 1);
});

test('charged release carries bounded strength into one execution', () => {
	const contexts = [];
	const timeline = createTimeline({
		execute: (ability, context) => acceptInto(contexts, context)
	});
	assert.equal(timeline.activate('joy-breaks-barriers', { now: 0 }).reason, 'charging');
	assert.equal(timeline.release(700).ok, true);
	assert.equal(contexts[0].chargeRatio, 0.5);
	assert.equal(timeline.snapshot(700).cooldowns.abilities[0].charges, 1);
});

test('channel commits once, emits three ticks, and completes once', () => {
	const ticks = [];
	const events = [];
	const timeline = createTimeline({
		bus: { emit: (type, detail) => events.push({ detail, type }) },
		onChannelTick: (ability, context, tickIndex) => ticks.push(tickIndex)
	});
	assert.equal(timeline.activate('voice-of-unity', targetContext()).reason, 'channeling');
	timeline.update(2400);
	assert.deepEqual(ticks, [1, 2, 3]);
	assert.equal(timeline.snapshot(2400).activeCast, null);
	assert.equal(events.filter(event => event.type === 'torah:cast-complete').length, 1);
});

test('invalid target, range, resource, and execution preserve cooldown', () => {
	const rejected = createTimeline({ execute: () => ({ ok: false, reason: 'world-rejected' }) });
	assert.equal(rejected.activate('light-against-concealment', { now: 0 }).reason, 'no-target');
	assert.equal(rejected.activate('light-against-concealment', {
		...targetContext(),
		distance: 20
	}).reason, 'out-of-range');
	const exhausted = createTimeline({ getResource: () => 0 });
	assert.equal(exhausted.activate('shield-of-trust', { now: 0 }).reason, 'insufficient-resource');
	assert.equal(rejected.activate('grateful-awakening', { now: 0 }).reason, 'world-rejected');
	assert.equal(rejected.readiness('grateful-awakening', { now: 1 }).ok, true);
});
function acceptInto(collection, value) {
	collection.push(value);
	return { ok: true };
}
function targetContext() {
	return { distance: 10, now: 0, target: { attackable: true, id: 'shade' } };
}
function createTimeline(overrides = {}) {
	return new TorahAbilityTimeline({
		execute: () => ({ ok: true }),
		getResource: () => 100,
		isUnlocked: () => true,
		...overrides
	});
}
