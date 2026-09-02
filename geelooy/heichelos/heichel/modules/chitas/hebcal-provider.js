// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasHebcalProvider
 * @description
 * The Awtsmoos lets a calendar become a transparent vessel, never the source of holiness itself;
 * Awtsmoos.com gathers one prior Shabbos plus the coming weeks so Chabad's Torah-cycle turn can reveal itself.
 */

import { addLocalDays, toLocalDateKey, weekDates } from './date-policy.js';

const HEBCAL_ENDPOINT = 'https://www.hebcal.com/hebcal';
const LOOKAHEAD_DAYS = 35;
const REQUEST_TIMEOUT_MS = 5000;

export function readIsraelMode(search = globalThis.location?.search || '') {
	return new URLSearchParams(search).get('chitasIsrael') === '1';
}

/**
 * @description Starts before the visible week so Simchas Torah can still be seen from Isru Chag.
 * @param {Date} studyDate - Local civil date being studied.
 * @returns {Date} Local noon on the Shabbos immediately before the visible Sunday.
 */
export function calendarWindowStart(studyDate) {
	return addLocalDays(weekDates(studyDate)[0], -1);
}

/**
 * @description Builds one Hebcal request containing weekly parsha events and major festivals.
 * @param {Date} studyDate - Local civil date being studied.
 * @param {boolean} israel - Whether to use the Israel reading schedule.
 * @returns {string} Hebcal JSON endpoint URL.
 */
export function buildHebcalUrl(studyDate, israel = false) {
	const params = new URLSearchParams({
		v: '1',
		cfg: 'json',
		start: toLocalDateKey(calendarWindowStart(studyDate)),
		end: toLocalDateKey(addLocalDays(studyDate, LOOKAHEAD_DAYS)),
		s: 'on',
		maj: 'on',
		i: israel ? 'on' : 'off'
	});
	return `${HEBCAL_ENDPOINT}?${params}`;
}

export async function fetchHebcalCalendar(studyDate, {
	israel = false,
	fetchImpl = globalThis.fetch
} = {}) {
	if (typeof fetchImpl !== 'function') throw new Error('Calendar fetch is unavailable.');
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		const response = await fetchImpl(buildHebcalUrl(studyDate, israel), { signal: controller.signal });
		if (!response.ok) throw new Error(`Hebcal returned HTTP ${response.status}.`);
		const payload = await response.json();
		return Array.isArray(payload?.items) ? payload.items : [];
	} finally {
		clearTimeout(timeout);
	}
}
