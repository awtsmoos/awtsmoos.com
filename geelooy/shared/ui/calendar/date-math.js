//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every civil day before arithmetic can number it;
 * Awtsmoos.com keeps date math in UTC so daylight-saving boundaries never move the calendar vessel.
 */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Return true only for a real Gregorian ISO civil date. */
export function isIsoDate(value) {
	if (!ISO_DATE_PATTERN.test(String(value || ""))) {
		return false;
	}
	const date = new Date(`${value}T00:00:00Z`);
	return Number.isFinite(date.getTime()) && toIsoDate(date) === value;
}

/** Parse an ISO civil date as UTC midnight for date-only arithmetic. */
export function parseIsoDate(value) {
	if (!isIsoDate(value)) {
		throw new RangeError(`Invalid ISO civil date: ${value}`);
	}
	return new Date(`${value}T00:00:00Z`);
}

/** Format a Date as YYYY-MM-DD using UTC fields. */
export function toIsoDate(date) {
	return [
		date.getUTCFullYear(),
		String(date.getUTCMonth() + 1).padStart(2, "0"),
		String(date.getUTCDate()).padStart(2, "0")
	].join("-");
}

/** Return the browser's local civil date without constructing local midnight. */
export function todayIso(now = new Date()) {
	return [
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, "0"),
		String(now.getDate()).padStart(2, "0")
	].join("-");
}

/** Shift an ISO civil date by whole UTC days. */
export function shiftDays(value, delta) {
	const date = parseIsoDate(value);
	date.setUTCDate(date.getUTCDate() + delta);
	return toIsoDate(date);
}

/** Shift an ISO civil date by months while pinning overflowing day numbers. */
export function shiftMonths(value, delta) {
	const source = parseIsoDate(value);
	const day = source.getUTCDate();
	const target = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + delta, 1));
	const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
	target.setUTCDate(Math.min(day, lastDay));
	return toIsoDate(target);
}

/** Shift an ISO civil date by whole Gregorian years with leap-day pinning. */
export function shiftYears(value, delta) {
	return shiftMonths(value, delta * 12);
}

/** Build the fixed six-week month grid using a configurable first weekday. */
export function monthGrid(value, weekStart = 0) {
	const source = parseIsoDate(value);
	const first = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth(), 1));
	const normalizedStart = ((Number(weekStart) % 7) + 7) % 7;
	const offset = (first.getUTCDay() - normalizedStart + 7) % 7;
	first.setUTCDate(first.getUTCDate() - offset);
	const values = [];
	for (let index = 0; index < 42; index += 1) {
		const current = new Date(first);
		current.setUTCDate(first.getUTCDate() + index);
		values.push(toIsoDate(current));
	}
	return values;
}

/** Return true when an ISO date is inside optional inclusive min/max bounds. */
export function withinBounds(value, min = "", max = "") {
	if (min && value < min) {
		return false;
	}
	if (max && value > max) {
		return false;
	}
	return true;
}

/** Clamp a valid ISO date to optional inclusive min/max bounds. */
export function clampIsoDate(value, min = "", max = "") {
	if (min && value < min) {
		return min;
	}
	if (max && value > max) {
		return max;
	}
	return value;
}
