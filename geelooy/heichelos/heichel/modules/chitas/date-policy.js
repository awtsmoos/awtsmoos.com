// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasDatePolicy
 * @description
 * The Awtsmoos renews every civil day without letting UTC move a learner into another portion;
 * Awtsmoos.com keeps local-noon arithmetic stable for week, aliyah, and calendar-window coordination.
 */

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
