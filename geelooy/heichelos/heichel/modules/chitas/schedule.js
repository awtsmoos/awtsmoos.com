// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasSchedule
 * @description
 * The Awtsmoos binds the coming Sidra to seven vessels of ascent and return;
 * Awtsmoos.com lets festivals delay a public reading while Chitas keeps its weekly flame to learn.
 */

import { PORTION_NAMES, WEEKDAY_NAMES } from './constants.js';
import { chabadStudyHref, toLocalDateKey, weekDates } from './date-policy.js';

/**
 * @description Finds the next actual weekly Sidra; festival displacement naturally skips holiday-only Shabbosos.
 * @param {Array<Object>} items - Hebcal calendar items sorted by date.
 * @returns {Object|null} First weekly parsha event.
 */
export function findNextParsha(items) {
	return items.find(item => item?.category === 'parashat') || null;
}

/**
 * @description Extracts exactly the seven full Shabbos aliyah boundaries used by the Chitas weekday cycle.
 * @param {Object} parsha - Hebcal parsha event.
 * @returns {string[]} Seven aliyah references, with graceful blanks for malformed provider data.
 */
export function sevenAliyahReadings(parsha) {
	return Array.from({ length: 7 }, (_, index) => parsha?.leyning?.[String(index + 1)] || '');
}

/**
 * @description Detects the annual Torah-cycle transition so its exceptional reading can remain explicit.
 * @param {Array<Object>} items - Hebcal calendar items.
 * @param {Date} date - Civil date under inspection.
 * @returns {boolean} Whether the date is Simchat Torah.
 */
export function isSimchatTorah(items, date) {
	const key = toLocalDateKey(date);
	return items.some(item => item?.date === key && /simchat torah/i.test(item?.title || ''));
}

/**
 * @description Builds the seven Daily Chitas study cards for one Sunday-through-Shabbos week.
 * @param {Date} studyDate - Current local civil date.
 * @param {Object|null} parsha - Upcoming weekly parsha event.
 * @param {Array<Object>} items - Calendar items used for exceptional-day detection.
 * @returns {Array<Object>} Seven virtual Living Path post records.
 */
export function buildStudyCards(studyDate, parsha, items = []) {
	const readings = sevenAliyahReadings(parsha);
	const todayKey = toLocalDateKey(studyDate);
	return weekDates(studyDate).map((date, index) => {
		const dateKey = toLocalDateKey(date);
		const today = dateKey === todayKey;
		const simchatTorah = isSimchatTorah(items, date);
		const reference = simchatTorah
			? 'Simchat Torah: Vezot Haberachah concludes and Bereishit begins as scheduled.'
			: readings[index] || 'Open Chabad Daily Study for the exact Chumash portion.';
		return {
			id: `chitas-${dateKey}`,
			name: `${today ? 'Today · ' : ''}${WEEKDAY_NAMES[index]} · ${PORTION_NAMES[index]}`,
			description: reference,
			type: 'post',
			virtualStudy: true,
			externalHref: chabadStudyHref(date),
			date: dateKey,
			aliyah: index + 1
		};
	});
}
