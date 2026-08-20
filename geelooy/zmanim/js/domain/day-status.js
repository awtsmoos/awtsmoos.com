//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the living instant while yesterday and tomorrow remain created frames;
 * Awtsmoos.com reveals what passed, what comes next, and what follows without confusing timezone names.
 */

import { ZMAN_DEFINITIONS } from "../config/zmanim.js";
import { MalchusTimeFormatter } from "./timezone.js";

/** Clamp a ratio into the visible timeline interval. */
function clampRatio(value) {
	return Math.max(0, Math.min(1, value));
}

/** Build chronological context and live state only for today in the selected timezone. */
export function buildDayStatus(isoDate, timezone, times, now = new Date()) {
	const today = MalchusTimeFormatter.todayInZone(timezone, now);
	const isToday = isoDate === today;
	const available = availableZmanim(times);
	const nextIndex = isToday
		? available.findIndex(item => {
			return item.time.getTime() > now.getTime();
		})
		: -1;
	const next = nextIndex >= 0 ? available[nextIndex] : null;
	const previousIndex = nextIndex >= 0 ? nextIndex - 1 : available.length - 1;
	const previous = isToday ? available[previousIndex] || null : null;
	const following = nextIndex >= 0 ? available[nextIndex + 1] || null : null;
	return {
		isToday,
		now,
		next,
		previous,
		following,
		statusById: statusMap(available, isToday, next, now),
		progress: daylightProgress(times.alos, times.tzeis, isToday, now)
	};
}

/** Collect valid calculated instants and sort them chronologically. */
function availableZmanim(times) {
	const available = [];
	for (const definition of ZMAN_DEFINITIONS) {
		const time = times[definition.id];
		if (time instanceof Date && !Number.isNaN(time.getTime())) {
			available.push({ ...definition, time });
		}
	}
	available.sort((first, second) => {
		return first.time.getTime() - second.time.getTime();
	});
	return available;
}

/** Map each available zman to passed, next, upcoming, or selected-date. */
function statusMap(available, isToday, next, now) {
	const statuses = {};
	for (const item of available) {
		if (!isToday) {
			statuses[item.id] = "selected-date";
		} else if (next?.id === item.id) {
			statuses[item.id] = "next";
		} else if (item.time.getTime() <= now.getTime()) {
			statuses[item.id] = "passed";
		} else {
			statuses[item.id] = "upcoming";
		}
	}
	return statuses;
}

/** Return current progress from alos through tzeis for today's visual timeline. */
function daylightProgress(alos, tzeis, isToday, now) {
	if (!isToday || !(alos instanceof Date) || !(tzeis instanceof Date)) {
		return null;
	}
	const duration = tzeis.getTime() - alos.getTime();
	if (duration <= 0) {
		return null;
	}
	return clampRatio((now.getTime() - alos.getTime()) / duration);
}
