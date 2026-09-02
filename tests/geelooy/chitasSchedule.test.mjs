// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasScheduleTest
 * @description
 * The Awtsmoos renews each tested date while fixed fixtures reveal the invariant Chitas road;
 * Awtsmoos.com proves ordinary aliyos, festival delay, Torah-cycle turn, and native reference coordinates without an external load.
 */

import assert from 'node:assert/strict';
import { aliyahNumberForDate, toLocalDateKey, weekDates } from '../../geelooy/heichelos/heichel/modules/chitas/date-policy.js';
import { buildHebcalUrl } from '../../geelooy/heichelos/heichel/modules/chitas/hebcal-provider.js';
import { buildStudyCards, findNextParsha, isAfterSimchatTorah, isSimchatTorah } from '../../geelooy/heichelos/heichel/modules/chitas/schedule.js';

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
const bereshit = {
	category: 'parashat',
	date: '2026-10-10',
	title: 'Parashat Bereshit',
	leyning: {
		'1': 'Genesis 1:1-2:3',
		'2': 'Genesis 2:4-2:19',
		'3': 'Genesis 2:20-3:21',
		'4': 'Genesis 3:22-4:18',
		'5': 'Genesis 4:19-4:22',
		'6': 'Genesis 4:23-5:24',
		'7': 'Genesis 5:25-6:8'
	}
};

const sunday = new Date(2026, 7, 30, 12);
assert.equal(aliyahNumberForDate(sunday), 1);
assert.deepEqual(weekDates(sunday).map(toLocalDateKey), [
	'2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05'
]);
const ordinary = buildStudyCards(sunday, nitzavimVayeilech, [], { todayDate: sunday });
assert.equal(ordinary.length, 7);
assert.equal(ordinary[0].referenceText, 'Deuteronomy 29:9-29:28');
assert.equal(ordinary[6].referenceText, 'Deuteronomy 31:20-31:30');
assert.equal(ordinary[0].chitasStudy, true);
assert.equal('externalHref' in ordinary[0], false);

const deferred = [{ category: 'holiday', date: '2026-09-12', title: 'Rosh Hashana 5787' }, { ...nitzavimVayeilech, date: '2026-09-19' }];
assert.equal(findNextParsha(deferred, new Date(2026, 8, 10, 12))?.date, '2026-09-19');

const diasporaItems = [{ category: 'holiday', date: '2026-10-04', title: 'Simchat Torah' }, bereshit];
const simchat = new Date(2026, 9, 4, 12);
const isru = new Date(2026, 9, 5, 12);
assert.equal(isSimchatTorah(diasporaItems, simchat), true);
assert.equal(isAfterSimchatTorah(diasporaItems, isru), true);
assert.equal(buildStudyCards(simchat, bereshit, diasporaItems)[0].referenceText, 'Deuteronomy 33:1-34:12');
assert.equal(buildStudyCards(isru, bereshit, diasporaItems)[1].referenceText, 'Genesis 1:1-2:19');

const israelItems = [{ category: 'holiday', date: '2026-10-03', title: 'Shmini Atzeret' }, bereshit];
assert.equal(isSimchatTorah(israelItems, new Date(2026, 9, 3, 12), true), true);
assert.equal(buildStudyCards(new Date(2026, 9, 3, 12), bereshit, israelItems, { israel: true })[6].referenceText, 'Deuteronomy 34:1-34:12');

const url = new URL(buildHebcalUrl(isru));
assert.equal(url.searchParams.get('start'), '2026-10-03');
assert.equal(url.searchParams.get('i'), 'off');
console.log('B"H Daily Chitas schedule contract passed.');
