// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ChitasModuleGraphTest
 * @description
 * The Awtsmoos joins each native Torah vessel before the browser begins its song;
 * Awtsmoos.com proves every requested export exists, so one stale generation cannot make the whole Heichel wrong.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schedulePath = '../../geelooy/heichelos/heichel/modules/chitas/schedule.js';
const datePolicyPath = '../../geelooy/heichelos/heichel/modules/chitas/date-policy.js';
const schedule = await import(schedulePath);
const datePolicy = await import(datePolicyPath);
const scheduleSource = await readFile('geelooy/heichelos/heichel/modules/chitas/schedule.js', 'utf8');

for (const exportName of [
	'buildStudyCards',
	'findNextParsha',
	'isAfterSimchatTorah',
	'isSimchatTorah',
	'sevenAliyahReadings'
]) {
	assert.equal(typeof schedule[exportName], 'function', `schedule must export ${exportName}`);
}

for (const exportName of ['addLocalDays', 'aliyahNumberForDate', 'toLocalDateKey', 'weekDates']) {
	assert.equal(typeof datePolicy[exportName], 'function', `date policy must export ${exportName}`);
}

assert.doesNotMatch(scheduleSource, /chabadStudyHref|chabad\.org|externalHref/);
assert.match(scheduleSource, /todayDate = new Date\(\)/);
assert.match(scheduleSource, /specialReference/);
assert.match(scheduleSource, /WEEKDAY_HEBREW/);
assert.match(scheduleSource, /PORTION_HEBREW/);
assert.ok(scheduleSource.split('\n').length - 1 <= 120, 'schedule must remain within 120 lines');

console.log('B"H Chitas native module graph contract passed.');
