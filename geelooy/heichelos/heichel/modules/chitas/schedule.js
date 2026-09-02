// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasSchedule
 * @description
 * The Awtsmoos binds one week to seven native Torah windows and turns the annual cycle without breaking the chain;
 * Awtsmoos.com records only coordinates, while Ikar's own chapter posts reveal every pasuk again.
 */

import { PORTION_NAMES, WEEKDAY_NAMES } from './constants.js?v=native-chitas-002';
import { addLocalDays, toLocalDateKey, weekDates } from './date-policy.js?v=native-chitas-002';

const WEEKDAY_HEBREW = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'];
const PORTION_HEBREW = ['חלק א׳', 'חלק ב׳', 'חלק ג׳', 'חלק ד׳', 'חלק ה׳', 'חלק ו׳', 'חלק ז׳'];
const VEZOT_STARTS = ['33:1', '33:8', '33:13', '33:18', '33:22', '33:27', '34:1'];

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

function endCoordinate(reference) {
	const match = /-(\d+:\d+)$/.exec(String(reference || ''));
	return match?.[1] || '';
}

function specialReference(items, date, index, readings, israel) {
	if (isSimchatTorah(items, date, israel)) {
		return `Deuteronomy ${VEZOT_STARTS[index]}-34:12`;
	}
	if (isAfterSimchatTorah(items, date, israel)) {
		const end = endCoordinate(readings[index]);
		return end ? `Genesis 1:1-${end}` : '';
	}
	return '';
}

export function buildStudyCards(studyDate, parsha, items = [], {
	israel = false,
	todayDate = new Date()
} = {}) {
	const readings = sevenAliyahReadings(parsha);
	const todayKey = toLocalDateKey(todayDate);
	return weekDates(studyDate).map((date, index) => {
		const dateKey = toLocalDateKey(date);
		const referenceText = specialReference(items, date, index, readings, israel) || readings[index] || '';
		const today = dateKey === todayKey;
		return {
			id: `chitas-${dateKey}`,
			name: `${today ? 'Today · ' : ''}${WEEKDAY_NAMES[index]} · ${PORTION_NAMES[index]}`,
			description: referenceText || 'Native Torah range is being resolved.',
			type: 'post',
			chitasStudy: true,
			date: dateKey,
			aliyah: index + 1,
			weekday: WEEKDAY_NAMES[index],
			weekdayHebrew: WEEKDAY_HEBREW[index],
			portion: PORTION_NAMES[index],
			portionHebrew: PORTION_HEBREW[index],
			referenceText
		};
	});
}
