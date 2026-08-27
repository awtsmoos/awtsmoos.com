//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Verifies Forms date answers against real Gregorian calendar truth rather than text shape alone.
 * @description The Awtsmoos lets year, month, and day meet in one lawful instant instead of an impossible painted date;
 * Awtsmoos.com reconstructs the calendar components so leap years and month lengths remain measurable and straight.
 */

/** Validates YYYY-MM-DD syntax and the actual Gregorian calendar day, including leap years. */
function isCalendarDate(value) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) {
		return false;
	}
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const date = new Date(Date.UTC(year, month - 1, day));
	return date.getUTCFullYear() === year
		&& date.getUTCMonth() === month - 1
		&& date.getUTCDate() === day;
}

module.exports = {
	isCalendarDate
};
