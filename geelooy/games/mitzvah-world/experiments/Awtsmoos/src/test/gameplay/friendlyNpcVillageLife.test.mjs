// B"H
/** Proves stable village identities, schedules, dialogue capabilities, and bounded clock rules. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { allFriendlyNpcProfiles } from '../../world/npc/FriendlyNpcProfiles.js';
import {
	advanceFriendlyNpcWorldHour,
	friendlyNpcDailyPeriod,
	friendlyNpcScheduleAt,
	friendlyNpcScheduleSnapshot
} from '../../world/npc/FriendlyNpcScheduleRules.js';

test('every named inhabitant has stable purpose, places, and four deterministic anchors', () => {
	const profiles = allFriendlyNpcProfiles();
	assert.ok(profiles.length >= 12);
	assert.equal(new Set(profiles.map(profile => profile.id)).size, profiles.length);
	for (const profile of profiles) {
		assert.ok(profile.role);
		assert.match(profile.home.id, /^H(?:1[0-9]|2[0-7])$/);
		assert.ok(profile.workplace.id);
		assert.deepEqual(Object.keys(profile.dailyAnchors), ['morning', 'day', 'evening', 'night']);
		for (const entry of Object.values(profile.dailyAnchors)) {
			assert.ok(entry.action);
			assert.ok(Number.isFinite(entry.location.x));
			assert.ok(Number.isFinite(entry.location.z));
		}
	}
});

test('dialogue, quest, vendor, and Torah metadata describe actual interaction modes', () => {
	const profiles = allFriendlyNpcProfiles();
	for (const profile of profiles) {
		assert.ok(profile.dialogueModes.includes('greeting'));
		assert.ok(profile.dialogueModes.includes('quest-progress'));
		assert.ok(profile.dialogueModes.includes('torah-discussion'));
		assert.equal(profile.quest.ids[0], profile.questId);
		assert.ok(profile.torah.topic);
		assert.ok(profile.torah.passageIds.length > 0);
		assert.equal(profile.dialogueModes.includes('vendor'), Boolean(profile.vendor));
	}
});

test('schedule boundaries and clock progression are deterministic', () => {
	assert.equal(friendlyNpcDailyPeriod(4.99), 'night');
	assert.equal(friendlyNpcDailyPeriod(5), 'morning');
	assert.equal(friendlyNpcDailyPeriod(10), 'day');
	assert.equal(friendlyNpcDailyPeriod(17), 'evening');
	assert.equal(friendlyNpcDailyPeriod(21), 'night');
	assert.equal(advanceFriendlyNpcWorldHour(23, 120, { dayLengthSeconds: 1440 }), 1);
	assert.equal(advanceFriendlyNpcWorldHour(8, 30, { playerState: { worldHour: 19 } }), 19);
});

test('schedule lookup returns canonical anchors without allocating replacements', () => {
	const profile = allFriendlyNpcProfiles()[0];
	assert.equal(friendlyNpcScheduleAt(profile, 8), profile.dailyAnchors.morning);
	assert.deepEqual(friendlyNpcScheduleSnapshot(profile, 12), {
		action: profile.dailyAnchors.day.action,
		locationId: profile.dailyAnchors.day.location.id,
		period: 'day'
	});
});
