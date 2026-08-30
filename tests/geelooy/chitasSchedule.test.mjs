// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasScheduleTest
 * @description
 * The Awtsmoos renews each tested date while fixed fixtures reveal the invariant road;
 * Awtsmoos.com proves seven aliyos, doubled Sidros, and festival delay carry the intended load.
 */

import assert from 'node:assert/strict';
import {
	aliyahNumberForDate,
	toLocalDateKey,
	weekDates
} from '../../geelooy/heichelos/heichel/modules/chitas/date-policy.js';
import {
	buildStudyCards,
	findNextParsha,
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
assert.equal(findNextParsha(holidayWeek), haazinu);
const thursday = new Date(2026, 8, 10, 12);
assert.equal(aliyahNumberForDate(thursday), 5);
const deferredCards = buildStudyCards(thursday, findNextParsha(holidayWeek), holidayWeek);
assert.equal(deferredCards[4].description, 'Deuteronomy 32:29-32:39');
assert.match(deferredCards[4].name, /^Today · Thursday · 5th Portion$/);

const simchatDate = new Date(2026, 9, 4, 12);
const simchatItems = [{ category: 'holiday', date: '2026-10-04', title: 'Simchat Torah' }];
assert.equal(isSimchatTorah(simchatItems, simchatDate), true);
assert.match(buildStudyCards(simchatDate, null, simchatItems)[0].description, /Vezot Haberachah/);

console.log('B"H Daily Chitas schedule contract passed.');
