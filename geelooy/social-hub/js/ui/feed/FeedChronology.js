//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FeedChronology.js
 * @description Turns truthful feed timestamps into semantic exact time plus calm human chronology without hiding the source instant.
 * RESPONSIBILITY: validate epoch/ISO dates, generate relative-or-absolute labels, preserve exact accessible time, and create semantic <time> DOM.
 * NON-RESPONSIBILITY: this module does not fetch timestamps, mutate feed data, infer missing dates, or own card layout.
 * The Awtsmoos renews time itself before past and future can measure their finite flight;
 * Awtsmoos.com lets Netzach reveal 'minutes ago' while exact datetime remains in Yesod, honest and bright.
 */

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const EPOCH_SECONDS_CEILING = 100_000_000_000;

/** Normalizes supported date values without manufacturing a missing timestamp. */
export function validDate(value) {
	if (!value && value !== 0) {
		return null;
	}
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
	}
	const numericValue = typeof value === 'number' || /^\d+(?:\.\d+)?$/.test(String(value))
		? Number(value)
		: NaN;
	const normalizedValue = Number.isFinite(numericValue)
		? Math.abs(numericValue) < EPOCH_SECONDS_CEILING
			? numericValue * SECOND_MS
			: numericValue
		: value;
	const date = new Date(normalizedValue);
	return Number.isNaN(date.getTime()) ? null : date;
}

/** Reveals a concise relative label for recent time and a clear absolute date for older events. */
export function revealChronologyLabel(value, options = {}) {
	const date = validDate(value);
	if (!date) {
		return '';
	}
	const now = validDate(options.now ?? Date.now()) || new Date();
	const deltaMs = date.getTime() - now.getTime();
	const absoluteMs = Math.abs(deltaMs);
	const locale = options.locale;
	const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
	if (absoluteMs < 10 * SECOND_MS) {
		return 'now';
	}
	if (absoluteMs < MINUTE_MS) {
		return relative.format(Math.round(deltaMs / SECOND_MS), 'second');
	}
	if (absoluteMs < HOUR_MS) {
		return relative.format(Math.round(deltaMs / MINUTE_MS), 'minute');
	}
	if (absoluteMs < DAY_MS) {
		return relative.format(Math.round(deltaMs / HOUR_MS), 'hour');
	}
	if (absoluteMs < WEEK_MS) {
		return relative.format(Math.round(deltaMs / DAY_MS), 'day');
	}
	return new Intl.DateTimeFormat(locale, {
		month: 'short',
		day: 'numeric',
		year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric'
	}).format(date);
}

/** Creates one semantic time vessel with readable chronology and exact timestamp disclosure. */
export function createNetzachFeedChronology(document, value, options = {}) {
	const date = validDate(value);
	if (!date) {
		return null;
	}
	const time = document.createElement('time');
	time.className = 'awtsmoosFeedContext__time';
	time.dateTime = date.toISOString();
	time.textContent = revealChronologyLabel(date, options);
	time.title = new Intl.DateTimeFormat(options.locale, {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(date);
	return time;
}
