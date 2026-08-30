// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasDatePolicy
 * @description
 * The Awtsmoos renews the civil day without surrendering it to UTC's distant line;
 * Awtsmoos.com keeps seven local-noon vessels so each aliyah meets its proper time.
 */

/**
 * @description Formats a browser-local civil date as YYYY-MM-DD without UTC drift.
 * @param {Date} date - Local study date.
 * @returns {string} Stable local civil-date key.
 */
export function toLocalDateKey(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * @description Adds civil days at local noon, where DST transitions cannot steal the intended date.
 * @param {Date} date - Starting local date.
 * @param {number} amount - Number of calendar days to add.
 * @returns {Date} New local-noon date.
 */
export function addLocalDays(date, amount) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 12);
}

/**
 * @description Reveals the Sunday-through-Shabbos week containing the supplied date.
 * @param {Date} date - Any date in the desired Chitas week.
 * @returns {Date[]} Seven local-noon civil dates.
 */
export function weekDates(date) {
	const sunday = addLocalDays(date, -date.getDay());
	return Array.from({ length: 7 }, (_, index) => addLocalDays(sunday, index));
}

/**
 * @description Converts JavaScript's Sunday-zero weekday into Chitas aliyah one-through-seven.
 * @param {Date} date - Local study date.
 * @returns {number} Daily Chumash aliyah number.
 */
export function aliyahNumberForDate(date) {
	return date.getDay() + 1;
}

/**
 * @description Builds Chabad's canonical Daily Chumash page for one exact civil date.
 * @param {Date} date - Local study date.
 * @returns {string} Trusted Chabad Daily Study URL.
 */
export function chabadStudyHref(date) {
	const dateValue = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
	return `https://www.chabad.org/dailystudy/torahreading.asp?tdate=${encodeURIComponent(dateValue)}`;
}
