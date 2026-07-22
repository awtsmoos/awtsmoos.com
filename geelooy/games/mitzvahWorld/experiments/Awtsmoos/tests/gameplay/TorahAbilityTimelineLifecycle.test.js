//B"H
//Boruch Hashem
//Blessed is He

/**
 * Guards the single Torah cast river from start through interruption and completion.
 * Netzach bears the casting light, Gevurah may close its gate;
 * Hod counts three channel beats, while Tiferes joins their fate.
 * Thus Awtsmoos.com reveals one measured clock, never timers that proliferate.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { torahAbilityDefinition } from '../../src/gameplay/combat/TorahAbilityCatalog.js';
import { TorahAbilityTimeline } from '../../src/gameplay/combat/TorahAbilityTimeline.js';

class MalchusEventBus {
	constructor() {
		this.events = [];
	}

	emit(type, detail) {
		this.events.push({ detail, type });
	}

	count(type) {
		return this.events.filter(event => event.type === type).length;
	}
}

function attackableShadow(distance) {
	return { attackable: true, distance, id: 'shadow-lifecycle-target' };
}

function createTiferesTimeline(yesodState) {
	const malchusBus = new MalchusEventBus();
	const executions = [];
	const channelTicks = [];
	const timeline = new TorahAbilityTimeline({
		bus: malchusBus,
		clock: () => yesodState.now,
		execute(definition, context) {
			executions.push({ context, definition });
			return { ok: true };
		},
		getResource: () => Infinity,
		isUnlocked: () => true,
		onChannelTick(definition, context, tickIndex) {
			channelTicks.push({ context, definition, tickIndex });
		}
	});
	return { channelTicks, executions, malchusBus, timeline };
}

test('cast executes once only at its canonical completion deadline', () => {
	const yesodState = { now: 1000 };
	const tiferes = createTiferesTimeline(yesodState);
	const clarity = torahAbilityDefinition('light-against-concealment');
	const context = { facing: true, target: attackableShadow(clarity.range) };
	const startedAt = yesodState.now;

	assert.equal(tiferes.timeline.activate(clarity.id, context).reason, 'casting');
	assert.equal(tiferes.executions.length, 0);
	yesodState.now = startedAt + clarity.castMilliseconds - 1;
	assert.equal(tiferes.timeline.update(), true);
	assert.equal(tiferes.executions.length, 0);
	yesodState.now = startedAt + clarity.castMilliseconds;
	assert.equal(tiferes.timeline.update(), false);
	assert.equal(tiferes.executions.length, 1);
	assert.equal(tiferes.timeline.snapshot().activeCast, null);
	tiferes.timeline.destroy();
});

test('interrupt clears the sole cast without executing it', () => {
	const yesodState = { now: 3000 };
	const tiferes = createTiferesTimeline(yesodState);
	const clarity = torahAbilityDefinition('light-against-concealment');
	const context = { facing: true, target: attackableShadow(clarity.range) };

	assert.equal(tiferes.timeline.activate(clarity.id, context).reason, 'casting');
	assert.equal(tiferes.timeline.interrupt('damage'), true);
	assert.equal(tiferes.timeline.interrupt('duplicate'), false);
	assert.equal(tiferes.executions.length, 0);
	assert.equal(tiferes.timeline.snapshot().diagnostics.interrupted, 1);
	assert.equal(tiferes.malchusBus.count('torah:interrupt'), 1);
	tiferes.timeline.destroy();
});

test('channel commits once, emits three bounded ticks, and completes once', () => {
	const yesodState = { now: 5000 };
	const tiferes = createTiferesTimeline(yesodState);
	const unity = torahAbilityDefinition('voice-of-unity');
	const context = { facing: true, target: attackableShadow(unity.range) };
	const startedAt = yesodState.now;
	const tickInterval = unity.channelMilliseconds / 3;

	assert.equal(tiferes.timeline.activate(unity.id, context).reason, 'channeling');
	assert.equal(tiferes.executions.length, 1);
	yesodState.now = startedAt + tickInterval;
	assert.equal(tiferes.timeline.update(), true);
	assert.deepEqual(tiferes.channelTicks.map(tick => tick.tickIndex), [1]);
	yesodState.now = startedAt + unity.channelMilliseconds;
	assert.equal(tiferes.timeline.update(), false);
	assert.deepEqual(tiferes.channelTicks.map(tick => tick.tickIndex), [1, 2, 3]);
	assert.equal(tiferes.malchusBus.count('torah:cast-complete'), 1);
	assert.equal(tiferes.timeline.snapshot().diagnostics.channelTicks, 3);
	assert.equal(tiferes.timeline.snapshot().activeCast, null);
	tiferes.timeline.destroy();
});
