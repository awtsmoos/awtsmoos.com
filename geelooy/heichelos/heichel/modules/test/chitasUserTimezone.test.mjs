// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chitasUserTimezone.test.mjs
 * @description
 * The Awtsmoos lets one civil day choose a week without letting the browser
 * machine's own timezone move the learner into another portion; Awtsmoos.com
 * guards the Daily Chitas "Today" label so it always follows the user's home
 * day (America/New_York, computed live), and guards the empty discovery
 * section so a virtual series never shows a bare heading with nothing under it.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { toLocalDateKey, userTodayDate } from '../chitas/date-policy.js';

const read = path => readFileSync(path, 'utf8');
const schedule = read('geelooy/heichelos/heichel/modules/chitas/schedule.js');
const weekState = read('geelooy/heichelos/heichel/modules/chitas/week-state.js');
const weekHeader = read('geelooy/heichelos/heichel/modules/ui/render/living-path/chitas-week-header.js');
const enhancer = read('geelooy/heichelos/heichel/ikar-first.js');
const fallback = read('geelooy/heichelos/heichel/semantic/fallback.html');

/** The reported check instant: Nov 9 00:28 UTC, still Nov 8 evening in New York. */
test('user today is New York at the reported check instant', () => {
	assert.equal(toLocalDateKey(userTodayDate(new Date('2026-11-09T00:28:49Z'))), '2026-11-08');
});

/** The home day flips at New York midnight, not at UTC midnight. */
test('user today flips at the New York midnight boundary', () => {
	assert.equal(toLocalDateKey(userTodayDate(new Date('2026-11-09T04:59:59Z'))), '2026-11-08');
	assert.equal(toLocalDateKey(userTodayDate(new Date('2026-11-09T05:00:00Z'))), '2026-11-09');
	assert.equal(toLocalDateKey(userTodayDate(new Date('2026-11-09T14:00:00-05:00'))), '2026-11-09');
});

/** Spring-forward keeps the same civil day on both sides of the jump. */
test('user today survives the spring-forward clock jump', () => {
	assert.equal(toLocalDateKey(userTodayDate(new Date('2026-03-08T06:59:59Z'))), '2026-03-08');
	assert.equal(toLocalDateKey(userTodayDate(new Date('2026-03-08T07:30:00Z'))), '2026-03-08');
});

/** Every "Today" source reads the live home day, never the machine timezone. */
test('today label, study date, and Today button all read the home day', () => {
	assert.match(schedule, /todayDate = userTodayDate\(\)/);
	assert.match(weekState, /fallback = userTodayDate\(\)/);
	assert.match(weekHeader, /navigate\(userTodayDate\(\), language\)/);
	assert.match(schedule, /import \{[^}]*userTodayDate[^}]*\} from '\.\/date-policy\.js/);
	assert.doesNotMatch(schedule, /todayDate = new Date\(\)/);
	assert.doesNotMatch(weekState, /fallback = new Date\(\)/);
	assert.doesNotMatch(weekHeader, /navigate\(new Date\(\), language\)/);
});

/** The home day is computed live; no date is ever hardcoded. */
test('no hardcoded study date in the chitas modules', () => {
	for (const [name, source] of [['schedule', schedule], ['weekState', weekState], ['weekHeader', weekHeader]]) {
		assert.doesNotMatch(source, /2026-11-0[89]/, `${name} must not hardcode a date`);
	}
});

/** An empty discovery list is removed, never left as a bare heading. */
test('empty discovery section is removed on client and in the server fallback', () => {
	assert.match(enhancer, /if \(items\.length === 0\) \{\s*discovery\.remove\(\);\s*return;\s*\}/);
	assert.match(fallback, /if \(discoveryList && !discoveryList\.querySelector\("li"\)\)/);
	assert.match(fallback, /discoveryNav\.remove\(\)/);
});

/** The series hero cover decodes off the main thread while loading eager. */
test('series hero cover keeps eager loading and gains async decoding', () => {
	assert.match(fallback, /loading="eager" fetchpriority="high" decoding="async"/);
});
