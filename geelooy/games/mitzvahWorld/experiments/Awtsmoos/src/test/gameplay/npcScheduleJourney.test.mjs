// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file npcScheduleJourney.test.mjs
 * @description Proves shared time becomes deterministic, cached, road-bound village life.
 * The Awtsmoos renews each destination and every step between; Awtsmoos.com verifies
 * prayer, work, gathering, and home without per-frame pathfinding or invalid teleportation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { FriendlyNpcWorldClock } from '../../world/npc/FriendlyNpcWorldClock.js';
import { allFriendlyNpcProfiles } from '../../world/npc/FriendlyNpcProfiles.js';
import {
	npcRoadJourney,
	sampleNpcRoadJourney
} from '../../world/npc/NpcRoadJourney.js';
import {
	applyNpcScheduleJourney,
	npcScheduleTravelDuration
} from '../../world/npc/NpcScheduleJourney.js';

const profile = allFriendlyNpcProfiles()[1];

test('one shared clock advances the village and honors authoritative world time', () => {
	const clock = new FriendlyNpcWorldClock({ initialHour: 13 });
	assert.equal(clock.update(60, null), 14);
	assert.equal(clock.update(0, { worldHour: 7.25 }), 7.25);
	assert.deepEqual(clock.stats(), {
		dayLengthSeconds: 1440,
		hour: 7.25,
		updates: 2
	});
});

test('canonical anchors connect through one cached authored-road journey', () => {
	const morning = profile.dailyAnchors.morning.location;
	const day = profile.dailyAnchors.day.location;
	const journey = npcRoadJourney(morning, day);
	const directDistance = Math.hypot(day.x - morning.x, day.z - morning.z);
	assert.ok(journey.points.length > 2);
	assert.ok(journey.totalLength >= directDistance);
	assert.equal(npcRoadJourney(morning, day), journey);
});

test('a same-anchor duty remains stationary without invalid route sampling', () => {
	const anchor = profile.dailyAnchors.morning.location;
	const journey = npcRoadJourney(anchor, anchor);
	const actor = {};
	sampleNpcRoadJourney(journey, 0.5, actor, 0.4);
	assert.equal(journey.totalLength, 0);
	assert.equal(npcScheduleTravelDuration(0, profile.walkSpeed), 0);
	assertNear(actor.routeCenterX, anchor.x);
	assertNear(actor.routeCenterZ, anchor.z);
});

test('one daily leg is reused across frames and arrives at work', () => {
	const actor = actorFor(profile);
	const morning = profile.dailyAnchors.morning.location;
	const day = profile.dailyAnchors.day.location;
	applyNpcScheduleJourney(actor, 10);
	const journey = actor.scheduleJourney;
	const duration = actor.scheduleTravelDuration;
	assert.equal(actor.dailyPeriod, 'day');
	assert.equal(actor.isTravelling, true);
	assertNear(actor.routeCenterX, morning.x);
	applyNpcScheduleJourney(actor, 10 + duration / 2);
	assert.equal(actor.scheduleJourney, journey);
	assert.equal(actor.scheduleChanges, 0);
	assert.notEqual(actor.routeCenterX, morning.x);
	applyNpcScheduleJourney(actor, 10 + duration + 0.01);
	assert.equal(actor.isTravelling, false);
	assert.equal(actor.currentAction, profile.dailyAnchors.day.action);
	assertNear(actor.routeCenterX, day.x);
	assertNear(actor.routeCenterZ, day.z);
});

test('direct time jumps catch up deterministically and count period changes once', () => {
	const actor = actorFor(profile);
	applyNpcScheduleJourney(actor, 13);
	assert.equal(actor.scheduleChanges, 0);
	applyNpcScheduleJourney(actor, 19.5);
	assert.equal(actor.dailyPeriod, 'evening');
	assert.equal(actor.scheduleChanges, 1);
	applyNpcScheduleJourney(actor, 23.9);
	assert.equal(actor.dailyPeriod, 'night');
	assert.equal(actor.scheduleChanges, 2);
	assertNear(actor.routeCenterX, profile.dailyAnchors.night.location.x);
	assertNear(actor.routeCenterZ, profile.dailyAnchors.night.location.z);
});

function actorFor(actorProfile) {
	return {
		dailyPeriod: null,
		profile: actorProfile,
		routeCenterX: actorProfile.x,
		routeCenterZ: actorProfile.z,
		scheduleChanges: 0
	};
}

function assertNear(actual, expected) {
	assert.ok(Math.abs(actual - expected) < 0.0001, `${actual} should be near ${expected}`);
}
