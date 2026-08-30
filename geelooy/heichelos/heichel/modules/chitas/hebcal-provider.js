// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasHebcalProvider
 * @description
 * The Awtsmoos lets a calendar become a transparent vessel, never the source of holiness itself;
 * Awtsmoos.com asks Hebcal only for dates and aliyah boundaries, then keeps Chabad's Chitas rule distinct and well.
 */

import { addLocalDays, toLocalDateKey } from './date-policy.js';

const HEBCAL_ENDPOINT = 'https://www.hebcal.com/hebcal';
const LOOKAHEAD_DAYS = 35;
const REQUEST_TIMEOUT_MS = 5000;

/**
 * @description Reads an explicit Israel-schedule override without guessing a visitor's halachic locale.
 * @param {string} search - URL query string.
 * @returns {boolean} True only when `chitasIsrael=1` is explicitly requested.
 */
export function readIsraelMode(search = globalThis.location?.search || '') {
	return new URLSearchParams(search).get('chitasIsrael') === '1';
}

/**
 * @description Builds one Hebcal calendar request containing weekly parsha events and major festivals.
 * @param {Date} studyDate - Local civil date being studied.
 * @param {boolean} israel - Whether to use the Israel reading schedule.
 * @returns {string} Hebcal JSON endpoint URL.
 */
export function buildHebcalUrl(studyDate, israel = false) {
	const params = new URLSearchParams({
		v: '1',
		cfg: 'json',
		start: toLocalDateKey(studyDate),
		end: toLocalDateKey(addLocalDays(studyDate, LOOKAHEAD_DAYS)),
		s: 'on',
		maj: 'on',
		i: israel ? 'on' : 'off'
	});
	return `${HEBCAL_ENDPOINT}?${params}`;
}

/**
 * @description Fetches calendar metadata with a short timeout so Daily Chitas cannot freeze Living Path.
 * @param {Date} studyDate - Local civil date being studied.
 * @param {Object} options - Provider options.
 * @param {boolean} [options.israel=false] - Israel reading schedule flag.
 * @param {Function} [options.fetchImpl=fetch] - Injectable fetch implementation for tests.
 * @returns {Promise<Array<Object>>} Hebcal calendar items.
 */
export async function fetchHebcalCalendar(studyDate, {
	israel = false,
	fetchImpl = globalThis.fetch
} = {}) {
	if (typeof fetchImpl !== 'function') throw new Error('Calendar fetch is unavailable.');
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		const response = await fetchImpl(buildHebcalUrl(studyDate, israel), {
			signal: controller.signal
		});
		if (!response.ok) throw new Error(`Hebcal returned HTTP ${response.status}.`);
		const payload = await response.json();
		return Array.isArray(payload?.items) ? payload.items : [];
	} finally {
		clearTimeout(timeout);
	}
}
