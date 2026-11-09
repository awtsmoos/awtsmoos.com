// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasDatePolicy
 * @description
 * The Awtsmoos renews every civil day without letting UTC move a learner into another portion;
 * Awtsmoos.com keeps local-noon arithmetic stable for week, aliyah, and calendar-window coordination.
 *
 * B"H — "today" for Chitas is the user's home day: America/New_York, computed
 * live from the clock through Intl, never hardcoded. The browser's own timezone
 * (a VM in UTC, a traveler on the West Coast) must not move the learner into
 * another day's portion: the "Today" label, the default study date, and the
 * Today button all read this one source.
 */

export const CHITAS_TIME_ZONE = 'America/New_York';

let userDayFormatter = null;
try {
	userDayFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: CHITAS_TIME_ZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
} catch {
	userDayFormatter = null;
}

/**
 * The current date in the user's home timezone (America/New_York), returned
 * as a local-noon Date in the browser's own timezone so the existing noon
 * arithmetic keeps working. Falls back to the browser-local date when the
 * home timezone is unavailable.
 * @param {Date} [now] Instant to read; defaults to the live clock.
 * @returns {Date} Local-noon Date for the user's home civil day.
 */
export function userTodayDate(now = new Date()) {
	if (userDayFormatter) {
		try {
			const parts = userDayFormatter.formatToParts(now);
			const value = (type) => Number(parts.find((part) => part.type === type)?.value);
			const year = value('year');
			const month = value('month');
			const day = value('day');
			if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
				return new Date(year, month - 1, day, 12);
			}
		} catch { /* fall through to the browser-local date */ }
	}
	return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
}

export function toLocalDateKey(date) {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0')
	].join('-');
}

export function addLocalDays(date, amount) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 12);
}

export function weekDates(date) {
	const localNoon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
	const sunday = addLocalDays(localNoon, -localNoon.getDay());
	return Array.from({ length: 7 }, (_, index) => addLocalDays(sunday, index));
}

export function aliyahNumberForDate(date) {
	return date.getDay() + 1;
}
