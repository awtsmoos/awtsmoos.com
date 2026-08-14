//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates each date before a calendar model grants it labels and state;
 * Awtsmoos.com derives one neutral month view that any page may render without importing page-specific fate.
 */

import { monthGrid, parseIsoDate, shiftMonths, withinBounds } from "./date-math.js";

/** Build the complete neutral presentation model for one six-week calendar view. */
export function buildCalendarModel(options) {
	const locale = options.locale || "en-US";
	const weekStart = normalizeWeekStart(options.weekStart);
	const viewDate = options.viewDate;
	const view = parseIsoDate(viewDate);
	const year = view.getUTCFullYear();
	const month = view.getUTCMonth();
	return {
		month,
		year,
		label: monthLabel(viewDate, locale),
		weekdays: weekdayLabels(locale, weekStart),
		months: monthOptions(year, locale, options.min, options.max),
		canPrevious: monthAvailable(shiftMonths(viewDate, -1), options.min, options.max),
		canNext: monthAvailable(shiftMonths(viewDate, 1), options.min, options.max),
		cells: dayCells({ ...options, weekStart, month, year, locale })
	};
}

/** Format a localized month and year label. */
export function monthLabel(value, locale = "en-US") {
	return new Intl.DateTimeFormat(locale, {
		month: "long",
		year: "numeric",
		timeZone: "UTC"
	}).format(parseIsoDate(value));
}

/** Return localized weekday headings beginning on the requested week-start day. */
export function weekdayLabels(locale = "en-US", weekStart = 0) {
	const formatter = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
	const sunday = new Date(Date.UTC(2026, 7, 9));
	const labels = [];
	for (let index = 0; index < 7; index += 1) {
		const date = new Date(sunday);
		date.setUTCDate(sunday.getUTCDate() + ((weekStart + index) % 7));
		labels.push(formatter.format(date));
	}
	return labels;
}

function dayCells(options) {
	const formatter = new Intl.DateTimeFormat(options.locale, { dateStyle: "full", timeZone: "UTC" });
	return monthGrid(options.viewDate, options.weekStart).map(value => {
		const date = parseIsoDate(value);
		const outside = date.getUTCMonth() !== options.month || date.getUTCFullYear() !== options.year;
		return {
			value,
			day: date.getUTCDate(),
			label: formatter.format(date),
			outside,
			hidden: outside && !options.showOutsideDays,
			selected: value === options.value,
			today: value === options.today,
			disabled: !withinBounds(value, options.min, options.max),
			tabbable: value === options.activeDate
		};
	});
}

function monthOptions(year, locale, min, max) {
	const formatter = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" });
	const options = [];
	for (let month = 0; month < 12; month += 1) {
		const value = `${year}-${String(month + 1).padStart(2, "0")}-01`;
		options.push({ month, label: formatter.format(parseIsoDate(value)), disabled: !monthAvailable(value, min, max) });
	}
	return options;
}

function monthAvailable(value, min = "", max = "") {
	const date = parseIsoDate(value);
	const first = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
	const lastDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
	const last = lastDate.toISOString().slice(0, 10);
	return (!max || first <= max) && (!min || last >= min);
}

function normalizeWeekStart(value) {
	return ((Number(value) % 7) + 7) % 7;
}
