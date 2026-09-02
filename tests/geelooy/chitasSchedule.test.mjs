// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasScheduleTest
 * @description
 * The Awtsmoos renews each tested date while fixed fixtures reveal the invariant road;
 * Awtsmoos.com proves seven aliyos, festival delay, Simchas Torah completion, and Isru Chag's newborn load.
 */

import assert from 'node:assert/strict';
import { aliyahNumberForDate, toLocalDateKey, weekDates } from '../../geelooy/heichelos/heichel/modules/chitas/date-policy.js';
import { buildHebcalUrl } from '../../geelooy/heichelos/heichel/modules/chitas/hebcal-provider.js';
import {
	buildStudyCards,
	findNextParsha,
	isAfterSimchatTorah,
	isSimchatTorah,
	sevenAliyahReadings
} from '../../geelooy/heichelos/heichel/modules/chitas/schedule.js';

const nitzavimVayeilech = {
	category: 'parashat',
	date: '2026-09-05',
	title: 'Parashat Nitzavim-Vayeilech',
	leyning: {
		'1': 'Deuteronomy 29:9-29:28',
		'2': 'Deuteronomy 30:1-30:6',
		'3': 'Deuteronomy 30:7-30:14',
		'4': 'Deuteronomy 30:15-31:6',
		'5': 'Deuteronomy 31:7-31:13',
		'6': 'Deuteronomy 31:14-31:19',
		'7': 'Deuteronomy 31:20-31:30'
	}
};
const haazinu = {
	category: 'parashat',
	date: '2026-09-19',
	title: 'Parashat Ha’azinu',
	leyning: {
		'1': 'Deuteronomy 32:1-32:6',
		'2': 'Deuteronomy 32:7-32:12',
		'3': 'Deuteronomy 32:13-32:18',
		'4': 'Deuteronomy 32:19-32:28',
		'5': 'Deuteronomy 32:29-32:39',
		'6': 'Deuteronomy 32:40-32:43',
		'7': 'Deuteronomy 32:44-32:52'
	}
};

const sunday = new Date(2026, 7, 30, 12);
assert.equal(aliyahNumberForDate(sunday), 1);
assert.deepEqual(
	weekDates(sunday).map(toLocalDateKey),
	['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05']
);
assert.deepEqual(sevenAliyahReadings(nitzavimVayeilech), Object.values(nitzavimVayeilech.leyning));
const ordinaryCards = buildStudyCards(sunday, nitzavimVayeilech);
assert.equal(ordinaryCards.length, 7);
assert.match(ordinaryCards[0].name, /^Today · Sunday · 1st Portion$/);
assert.equal(ordinaryCards[0].description, 'Deuteronomy 29:9-29:28');
assert.match(ordinaryCards[0].externalHref, /^https:\/\/www\.chabad\.org\/dailystudy\//);

const holidayWeek = [
	{ category: 'holiday', date: '2026-09-12', title: 'Rosh Hashana 5787' },
	haazinu
];
const thursday = new Date(2026, 8, 10, 12);
assert.equal(findNextParsha(holidayWeek, thursday), haazinu);
assert.equal(aliyahNumberForDate(thursday), 5);
assert.equal(buildStudyCards(thursday, haazinu, holidayWeek)[4].description, 'Deuteronomy 32:29-32:39');

const diasporaSimchat = new Date(2026, 9, 4, 12);
const diasporaIsru = new Date(2026, 9, 5, 12);
const diasporaItems = [
	{ category: 'holiday', date: '2026-10-04', title: 'Simchat Torah' },
	{ ...nitzavimVayeilech, date: '2026-10-10', title: 'Parashat Bereshit' }
];
assert.equal(isSimchatTorah(diasporaItems, diasporaSimchat), true);
assert.equal(isAfterSimchatTorah(diasporaItems, diasporaIsru), true);
assert.match(buildStudyCards(diasporaSimchat, diasporaItems[1], diasporaItems)[0].description, /Vezot Haberachah: 1st Portion through the end/);
assert.match(buildStudyCards(diasporaIsru, diasporaItems[1], diasporaItems)[1].description, /Bereishit: from the beginning through 2nd Portion/);

const israelSimchat = new Date(2026, 9, 3, 12);
const israelIsru = new Date(2026, 9, 4, 12);
const israelItems = [{ category: 'holiday', date: '2026-10-03', title: 'Shmini Atzeret' }];
assert.equal(isSimchatTorah(israelItems, israelSimchat, true), true);
assert.equal(isAfterSimchatTorah(israelItems, israelIsru, true), true);
assert.match(buildStudyCards(israelIsru, null, israelItems, { israel: true })[0].description, /Bereishit: from the beginning through 1st Portion/);

const mondayUrl = new URL(buildHebcalUrl(diasporaIsru));
assert.equal(mondayUrl.searchParams.get('start'), '2026-10-03');
assert.equal(mondayUrl.searchParams.get('i'), 'off');
console.log('B"H Daily Chitas schedule contract passed.');
