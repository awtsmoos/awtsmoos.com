//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos contains every direction before a key names left or right;
 * Awtsmoos.com turns familiar calendar keystrokes into civil-date motion without DOM dependence.
 */

import { parseIsoDate, shiftDays, shiftMonths, shiftYears } from "./date-math.js";

const NAVIGATION_KEYS = new Set([
	"ArrowLeft",
	"ArrowRight",
	"ArrowUp",
	"ArrowDown",
	"Home",
	"End",
	"PageUp",
	"PageDown"
]);

/** Return true when a keyboard event belongs to calendar date navigation. */
export function isCalendarNavigationKey(key) {
	return NAVIGATION_KEYS.has(key);
}

/** Calculate the date a standard calendar key should focus. */
export function keyboardTarget(value, key, options = {}) {
	const weekStart = normalizeWeekStart(options.weekStart);
	if (key === "ArrowLeft") {
		return shiftDays(value, -1);
	}
	if (key === "ArrowRight") {
		return shiftDays(value, 1);
	}
	if (key === "ArrowUp") {
		return shiftDays(value, -7);
	}
	if (key === "ArrowDown") {
		return shiftDays(value, 7);
	}
	if (key === "PageUp") {
		return options.shiftKey ? shiftYears(value, -1) : shiftMonths(value, -1);
	}
	if (key === "PageDown") {
		return options.shiftKey ? shiftYears(value, 1) : shiftMonths(value, 1);
	}
	if (key === "Home") {
		return shiftDays(value, -distanceFromWeekStart(value, weekStart));
	}
	if (key === "End") {
		return shiftDays(value, 6 - distanceFromWeekStart(value, weekStart));
	}
	return value;
}

function distanceFromWeekStart(value, weekStart) {
	const weekday = parseIsoDate(value).getUTCDay();
	return (weekday - weekStart + 7) % 7;
}

function normalizeWeekStart(value) {
	return ((Number(value) % 7) + 7) % 7;
}
