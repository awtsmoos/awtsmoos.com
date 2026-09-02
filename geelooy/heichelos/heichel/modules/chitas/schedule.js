// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasSchedule
 * @description
 * The Awtsmoos joins each civil day to its native Torah window while the annual cycle turns without a severed ray;
 * Awtsmoos.com keeps exact coordinates and gentle human descriptions together, with no stale external study path in the way.
 */

import { PORTION_NAMES, WEEKDAY_NAMES } from './constants.js?v=native-chitas-003';
import { addLocalDays, toLocalDateKey, weekDates } from './date-policy.js?v=native-chitas-003';

const WEEKDAY_HEBREW = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'];
const PORTION_HEBREW = ['חלק א׳', 'חלק ב׳', 'חלק ג׳', 'חלק ד׳', 'חלק ה׳', 'חלק ו׳', 'חלק ז׳'];
const VEZOT_STARTS = ['33:1', '33:8', '33:13', '33:18', '33:22', '33:27', '34:1'];
const BERESHIT_ENDS = ['2:3', '2:19', '3:21', '4:18', '4:22', '5:24', '6:8'];

function eventFallsOn(item, date) {
	return item?.date === toLocalDateKey(date);
}

export function findNextParsha(items, studyDate = null) {
	const minimum = studyDate ? toLocalDateKey(studyDate) : '';
	return items.find(item => item?.category === 'parashat' && (!minimum || item.date >= minimum)) || null;
}

export function sevenAliyahReadings(parsha) {
	return Array.from({ length: 7 }, (_, index) => parsha?.leyning?.[String(index + 1)] || '');
}

export function isSimchatTorah(items, date, israel = false) {
	return items.some(item => {
		if (!eventFallsOn(item, date)) return false;
		const title = String(item?.title || '');
		return /simcha[st]\s+torah/i.test(title) || (israel && /shmini atzeret/i.test(title));
	});
}

export function isAfterSimchatTorah(items, date, israel = false) {
	return isSimchatTorah(items, addLocalDays(date, -1), israel);
}

function specialReference(items, date, index, readings, israel) {
	if (isSimchatTorah(items, date, israel)) {
		return `Deuteronomy ${VEZOT_STARTS[index]}-34:12`;
	}
	if (isAfterSimchatTorah(items, date, israel)) {
		return `Genesis 1:1-${BERESHIT_ENDS[index]}`;
	}
	return readings[index] || '';
}

function transitionDescription(items, date, index, referenceText, israel) {
	if (isSimchatTorah(items, date, israel)) {
		return `Vezot Haberachah: ${PORTION_NAMES[index]} through the end of the Sidra.`;
	}
	if (isAfterSimchatTorah(items, date, israel)) {
		return `Bereishit: from the beginning through ${PORTION_NAMES[index]}.`;
	}
	return referenceText || 'Native Torah range is being resolved.';
}

/**
 * Builds seven native Living Path study cards, with exact references remaining primary data.
 * @param {Date} studyDate Local civil study date.
 * @param {Object|null} parsha Upcoming weekly parsha event.
 * @param {Array<Object>} items Calendar items for Torah-cycle transitions.
 * @param {{israel?:boolean,todayDate?:Date}} options Stable rendering options.
 * @returns {Array<Object>} Seven Daily Chitas cards.
 */
export function buildStudyCards(studyDate, parsha, items = [], {
	israel = false,
	todayDate = new Date()
} = {}) {
	const readings = sevenAliyahReadings(parsha);
	const todayKey = toLocalDateKey(todayDate);
	return weekDates(studyDate).map((date, index) => {
		const dateKey = toLocalDateKey(date);
		const referenceText = specialReference(items, date, index, readings, israel);
		const today = dateKey === todayKey;
		return {
			id: `chitas-${dateKey}`,
			name: `${today ? 'Today · ' : ''}${WEEKDAY_NAMES[index]} · ${PORTION_NAMES[index]}`,
			description: transitionDescription(items, date, index, referenceText, israel),
			type: 'post',
			chitasStudy: true,
			date: dateKey,
			aliyah: index + 1,
			weekdayHebrew: WEEKDAY_HEBREW[index],
			portionHebrew: PORTION_HEBREW[index],
			referenceText
		};
	});
}
