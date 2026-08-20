// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchHistoryGroups
 * @description
 * The Awtsmoos gathers a long search journey into years, months, and days without losing chronological truth;
 * Awtsmoos.com lets hundreds of local searches remain navigable while Today and Yesterday still feel immediate.
 */

function dateParts(timestamp) {
	const date = new Date(timestamp);
	return {
		date,
		year: date.getFullYear(),
		month: date.getMonth(),
		day: date.getDate()
	};
}

function sameDay(left, right) {
	return left.getFullYear() === right.getFullYear()
		&& left.getMonth() === right.getMonth()
		&& left.getDate() === right.getDate();
}

function dayLabel(date) {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	if (sameDay(date, today)) return 'Today';
	if (sameDay(date, yesterday)) return 'Yesterday';
	return date.toLocaleDateString(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	});
}

function monthLabel(date) {
	return date.toLocaleDateString(undefined, { month: 'long' });
}

function createYear(parts) {
	return {
		key: String(parts.year),
		label: String(parts.year),
		months: []
	};
}

function createMonth(parts) {
	return {
		key: `${parts.year}-${parts.month}`,
		label: monthLabel(parts.date),
		days: []
	};
}

function createDay(parts) {
	return {
		key: `${parts.year}-${parts.month}-${parts.day}`,
		label: dayLabel(parts.date),
		entries: []
	};
}

export function groupHistoryByDate(entries = []) {
	const years = [];
	for (const entry of entries) {
		const parts = dateParts(entry.visitedAt);
		let year = years.at(-1);
		if (!year || year.key !== String(parts.year)) {
			year = createYear(parts);
			years.push(year);
		}
		let month = year.months.at(-1);
		const monthKey = `${parts.year}-${parts.month}`;
		if (!month || month.key !== monthKey) {
			month = createMonth(parts);
			year.months.push(month);
		}
		let day = month.days.at(-1);
		const dayKey = `${parts.year}-${parts.month}-${parts.day}`;
		if (!day || day.key !== dayKey) {
			day = createDay(parts);
			month.days.push(day);
		}
		day.entries.push(entry);
	}
	return years;
}
