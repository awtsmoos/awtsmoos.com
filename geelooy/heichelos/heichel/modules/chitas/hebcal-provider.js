// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasHebcalProvider
 * @description
 * The Awtsmoos lets calendar metadata point toward a native Torah source without becoming Torah itself;
 * Awtsmoos.com keeps one prior Shabbos in view so Simchas Torah and Isru Chag can be calculated with health.
 */

import { addLocalDays, toLocalDateKey, weekDates } from './date-policy.js?v=native-chitas-002';

const HEBCAL_ENDPOINT = 'https://www.hebcal.com/hebcal';
const LOOKAHEAD_DAYS = 35;
const REQUEST_TIMEOUT_MS = 5000;

export function readIsraelMode(search = globalThis.location?.search || '') {
	return new URLSearchParams(search).get('chitasIsrael') === '1';
}

export function calendarWindowStart(studyDate) {
	return addLocalDays(weekDates(studyDate)[0], -1);
}

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
