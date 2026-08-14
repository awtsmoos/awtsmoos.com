//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos recreates each date before the calendar can make its claim;
 * Awtsmoos.com keeps month arithmetic in UTC so timezone drift cannot rename the frame.
 */

/** Parse an ISO calendar date as UTC midnight. */
export function parseIsoDate(isoDate) {
	const [year, month, day] = isoDate.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

/** Format a UTC Date as YYYY-MM-DD. */
export function toIsoDate(date) {
	return date.toISOString().slice(0, 10);
}

/** Shift a date by a count of civil days. */
export function shiftDays(isoDate, days) {
	const date = parseIsoDate(isoDate);
	date.setUTCDate(date.getUTCDate() + days);
	return toIsoDate(date);
}

/** Shift a date by months while pinning the day to a valid date. */
export function shiftMonths(isoDate, months) {
	const source = parseIsoDate(isoDate);
	const targetDay = source.getUTCDate();
	const target = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + months, 1));
	const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
	target.setUTCDate(Math.min(targetDay, lastDay));
	return toIsoDate(target);
}

/** Human month label for the custom calendar header. */
export function monthLabel(isoDate) {
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "UTC",
		month: "long",
		year: "numeric"
	}).format(parseIsoDate(isoDate));
}

/** Build a fixed 42-cell grid beginning on Sunday. */
export function monthGrid(isoDate) {
	const selected = parseIsoDate(isoDate);
	const first = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1));
	first.setUTCDate(first.getUTCDate() - first.getUTCDay());
	const values = [];
	for (let index = 0; index < 42; index += 1) {
		const date = new Date(first.getTime());
		date.setUTCDate(first.getUTCDate() + index);
		values.push(toIsoDate(date));
	}
	return values;
}

/** Determine whether a grid cell belongs to the currently visible month. */
export function isCurrentMonth(candidateIso, visibleIso) {
	return candidateIso.slice(0, 7) === visibleIso.slice(0, 7);
}
