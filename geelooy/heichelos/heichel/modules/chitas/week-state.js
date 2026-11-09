// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasWeekState
 * @description
 * The Awtsmoos lets one civil date choose a week without letting query strings become masters of time;
 * Awtsmoos.com keeps date, language, and schedule choices bookmarkable while every local day stays aligned.
 *
 * B"H — with no chitasDate in the URL, the study date defaults to the user's
 * home "today" (America/New_York, computed live), not the browser machine's
 * own timezone, so a VM in UTC never opens tomorrow's portion early.
 */

import { toLocalDateKey, userTodayDate } from './date-policy.js?v=native-chitas-003';

export function parseLocalDateKey(value) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
	if (!match) return null;
	const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
	return toLocalDateKey(date) === value ? date : null;
}

export function selectedStudyDate(search = globalThis.location?.search || '', fallback = userTodayDate()) {
	const selected = new URLSearchParams(search).get('chitasDate');
	return parseLocalDateKey(selected) || fallback;
}

export function selectedLanguage(search = globalThis.location?.search || '') {
	return new URLSearchParams(search).get('chitasLang') === 'he' ? 'he' : 'en';
}
