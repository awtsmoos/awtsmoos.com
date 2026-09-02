// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasSchedule
 * @description
 * The Awtsmoos binds a weekly Sidra to seven vessels, then turns the Torah cycle without losing a day;
 * Awtsmoos.com keeps festival delay, Simchas Torah completion, and Isru Chag renewal on Chabad's stated way.
 */

import { PORTION_NAMES, WEEKDAY_NAMES } from './constants.js';
import { addLocalDays, chabadStudyHref, toLocalDateKey, weekDates } from './date-policy.js';

function eventFallsOn(item, date) {
	return item?.date === toLocalDateKey(date);
}

/**
 * @description Finds the next actual weekly Sidra, excluding a prior Shabbos retained only for transition context.
 * @param {Array<Object>} items - Hebcal calendar items sorted by date.
 * @param {Date|null} studyDate - Earliest acceptable weekly parsha date.
 * @returns {Object|null} First forthcoming weekly parsha event.
 */
export function findNextParsha(items, studyDate = null) {
	const minimum = studyDate ? toLocalDateKey(studyDate) : '';
	return items.find(item => item?.category === 'parashat' && (!minimum || item.date >= minimum)) || null;
}

/**
 * @description Extracts the seven full Shabbos aliyah boundaries used by the ordinary Chitas weekday cycle.
 * @param {Object} parsha - Hebcal parsha event.
 * @returns {string[]} Seven aliyah references.
 */
export function sevenAliyahReadings(parsha) {
	return Array.from({ length: 7 }, (_, index) => parsha?.leyning?.[String(index + 1)] || '');
}

/**
 * @description Detects the annual Torah-cycle completion in Diaspora or Israel mode.
 * @param {Array<Object>} items - Hebcal calendar items.
 * @param {Date} date - Civil date under inspection.
 * @param {boolean} israel - Whether Shmini Atzeret is also Simchas Torah.
 * @returns {boolean} Whether Chitas completes Vezos Haberachah on this date.
 */
export function isSimchatTorah(items, date, israel = false) {
	return items.some(item => {
		if (!eventFallsOn(item, date)) return false;
		const title = item?.title || '';
		return /simcha[st]\s+torah/i.test(title) || (israel && /shmini atzeret/i.test(title));
	});
}

/**
 * @description Detects Isru Chag from the previous day's actual Torah-cycle completion event.
 * @param {Array<Object>} items - Hebcal calendar items.
 * @param {Date} date - Civil date under inspection.
 * @param {boolean} israel - Israel schedule flag.
 * @returns {boolean} Whether this is the day following Simchas Torah.
 */
export function isAfterSimchatTorah(items, date, israel = false) {
	return isSimchatTorah(items, addLocalDays(date, -1), israel);
}

function transitionReference(items, date, portionIndex, israel) {
	if (isSimchatTorah(items, date, israel)) {
		return `Vezot Haberachah: ${PORTION_NAMES[portionIndex]} through the end of the Sidra.`;
	}
	if (isAfterSimchatTorah(items, date, israel)) {
		return `Bereishit: from the beginning through ${PORTION_NAMES[portionIndex]}.`;
	}
	return '';
}

/**
 * @description Builds the seven Daily Chitas study cards for one Sunday-through-Shabbos week.
 * @param {Date} studyDate - Current local civil date.
 * @param {Object|null} parsha - Upcoming weekly parsha event.
 * @param {Array<Object>} items - Calendar items used for exceptional-day detection.
 * @param {Object} options - Schedule options.
 * @param {boolean} [options.israel=false] - Israel reading schedule flag.
 * @returns {Array<Object>} Seven virtual Living Path post records.
 */
export function buildStudyCards(studyDate, parsha, items = [], { israel = false } = {}) {
	const readings = sevenAliyahReadings(parsha);
	const todayKey = toLocalDateKey(studyDate);
	return weekDates(studyDate).map((date, index) => {
		const dateKey = toLocalDateKey(date);
		const today = dateKey === todayKey;
		const special = transitionReference(items, date, index, israel);
		return {
			id: `chitas-${dateKey}`,
			name: `${today ? 'Today · ' : ''}${WEEKDAY_NAMES[index]} · ${PORTION_NAMES[index]}`,
			description: special || readings[index] || 'Open Chabad Daily Study for the exact Chumash portion.',
			type: 'post',
			virtualStudy: true,
			externalHref: chabadStudyHref(date),
			date: dateKey,
			aliyah: index + 1
		};
	});
}
