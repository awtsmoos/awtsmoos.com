//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates the measured day while halachah clothes it with intent;
 * Awtsmoos.com keeps every supported boundary formula explicit, comparable, and transparent.
 *
 * Rounding is the careful way, as Chabad.org does it: every time is first cut to
 * the whole second, then the sun's own events (dawn, sunrise, sunset) are rounded
 * down to the minute they occur in, action starts are rounded up (misheyakir,
 * mincha, plag, nightfall, Shabbos end), and deadlines are rounded down (latest
 * Shema, latest Shacharis, chametz, candle lighting). Showing raw seconds cut off
 * would show a start time up to 59 seconds too early. Jerusalem lights candles
 * 40 minutes before sunset; everywhere else the common custom is 18 minutes.
 */

import { getZmanimOpinion } from "../config/opinions.js";

const MINUTE_MS = 60000;
const SECOND_MS = 1000;
const ZMANIYOS_MINUTES_PER_DAY = 720;
const JERUSALEM_LATITUDE = 31.7683;
const JERUSALEM_LONGITUDE = 35.2137;
const JERUSALEM_RADIUS_DEGREES = 0.25;
const CANDLE_MINUTES_DEFAULT = 18;
const CANDLE_MINUTES_JERUSALEM = 40;

/**
 * Rounding direction per zman, derived from Chabad.org's printed times against
 * its own exact method (Brooklyn 2026-11-09, Jerusalem 2026-11-06). The sun's
 * own events (dawn, sunrise, sunset) are floored: the minute the event occurs
 * in. Action thresholds are careful: starts round up (misheyakir, mincha,
 * plag, nightfall, Shabbos end), deadlines round down (latest Shema,
 * latest Shacharis, chametz, candle lighting). Midpoints round down.
 */
const ZMAN_ROUNDING = Object.freeze({
	alos: "down",
	alos72: "up",
	misheyakir: "up",
	sunrise: "down",
	sofShema: "down",
	sofTefillah: "down",
	sofAchilasChametz: "down",
	sofBiur: "down",
	chatzos: "down",
	minchaGedola: "up",
	minchaKetana: "up",
	plag: "up",
	candleLighting: "down",
	sunset: "down",
	tzeis: "up",
	shabbosEnd: "up",
	rabbeinuTam72: "up",
	chatzosHalailah: "down"
});

/** Shift a valid instant by ordinary clock minutes. */
function addMinutes(date, minutes) {
	return date instanceof Date
		? new Date(date.getTime() + minutes * MINUTE_MS)
		: null;
}

/** Return a fractional point in a resolved halachic day. */
function seasonalPoint(dayStart, shaahMillis, hours) {
	if (!(dayStart instanceof Date) || !Number.isFinite(shaahMillis)) {
		return null;
	}
	return new Date(dayStart.getTime() + shaahMillis * hours);
}

/** Midpoint between two valid instants, otherwise null. */
function midpoint(start, end) {
	if (!(start instanceof Date) || !(end instanceof Date)) {
		return null;
	}
	return new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);
}

/** Resolve a proportional-minute offset from standard sunrise through sunset. */
function zmaniyosOffset(solar, minutes) {
	if (!(solar.sunrise instanceof Date) || !(solar.sunset instanceof Date)) {
		return Number.NaN;
	}
	const daylight = solar.sunset.getTime() - solar.sunrise.getTime();
	return daylight * minutes / ZMANIYOS_MINUTES_PER_DAY;
}

/** True when a location is Jerusalem, by name or by coordinates. */
function isJerusalem(location) {
	if (!location || typeof location !== "object") {
		return false;
	}
	const label = String(location.label || location.name || "").toLowerCase();
	if (label.includes("jerusalem")) {
		return true;
	}
	const latitude = Number(location.latitude);
	const longitude = Number(location.longitude);
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
		return false;
	}
	return Math.abs(latitude - JERUSALEM_LATITUDE) <= JERUSALEM_RADIUS_DEGREES
		&& Math.abs(longitude - JERUSALEM_LONGITUDE) <= JERUSALEM_RADIUS_DEGREES;
}

/** Minutes before sunset for candle lighting: 40 in Jerusalem, 18 elsewhere. */
function candleLightingMinutes(location) {
	return isJerusalem(location) ? CANDLE_MINUTES_JERUSALEM : CANDLE_MINUTES_DEFAULT;
}

/** Cut an instant down to the whole second, dropping milliseconds. */
function cutToSecond(date) {
	if (!(date instanceof Date)) {
		return null;
	}
	return new Date(Math.floor(date.getTime() / SECOND_MS) * SECOND_MS);
}

/**
 * Round one zman to the minute the careful way: cut to the whole second first,
 * then down for a deadline, up for a start. A null instant stays null.
 */
function roundZman(date, direction) {
	const cut = cutToSecond(date);
	if (!cut) {
		return null;
	}
	if (direction === "up") {
		const remainder = cut.getTime() % MINUTE_MS;
		return remainder === 0 ? cut : new Date(cut.getTime() + (MINUTE_MS - remainder));
	}
	return new Date(cut.getTime() - (cut.getTime() % MINUTE_MS));
}

/** Pure halachic calculations over a supplied set of astronomical anchors. */
export class TiferesZmanimCalculator {
	/** Resolve the seasonal-day boundaries for any supported calculation profile. */
	static dayBoundaries(solar, opinionId) {
		const opinion = getZmanimOpinion(opinionId);
		if (opinion.dayMode === "fixed") {
			return {
				opinion,
				start: addMinutes(solar.sunrise, -opinion.minutes),
				end: addMinutes(solar.sunset, opinion.minutes)
			};
		}
		if (opinion.dayMode === "zmaniyos") {
			const offset = zmaniyosOffset(solar, opinion.minutes);
			return {
				opinion,
				start: Number.isFinite(offset) ? new Date(solar.sunrise.getTime() - offset) : null,
				end: Number.isFinite(offset) ? new Date(solar.sunset.getTime() + offset) : null
			};
		}
		return {
			opinion,
			start: solar[opinion.startKey] || null,
			end: solar[opinion.endKey] || null
		};
	}

	/** Return one proportional-hour instant using already-resolved day boundaries. */
	static point(boundaries, shaahMillis, hours) {
		return seasonalPoint(boundaries.start, shaahMillis, hours);
	}

	/** Calculate practical zmanim while retaining method metadata separately. */
	static calculate(solar, opinionId = "chabad", location = null) {
		const boundaries = this.dayBoundaries(solar, opinionId);
		const validDay = boundaries.start instanceof Date && boundaries.end instanceof Date;
		const shaahMillis = validDay
			? (boundaries.end.getTime() - boundaries.start.getTime()) / 12
			: Number.NaN;
		const rawTimes = {
			alos: solar.alos,
			alos72: addMinutes(solar.sunrise, -72),
			misheyakir: solar.misheyakir,
			sunrise: solar.sunrise,
			sofShema: this.point(boundaries, shaahMillis, 3),
			sofTefillah: this.point(boundaries, shaahMillis, 4),
			sofAchilasChametz: this.point(boundaries, shaahMillis, 4),
			sofBiur: this.point(boundaries, shaahMillis, 5),
			chatzos: this.point(boundaries, shaahMillis, 6),
			minchaGedola: this.point(boundaries, shaahMillis, 6.5),
			minchaKetana: this.point(boundaries, shaahMillis, 9.5),
			plag: this.point(boundaries, shaahMillis, 10.75),
			candleLighting: addMinutes(solar.sunset, -candleLightingMinutes(location)),
			sunset: solar.sunset,
			tzeis: solar.tzeis,
			shabbosEnd: solar.shabbosEnd,
			rabbeinuTam72: addMinutes(solar.sunset, 72),
			chatzosHalailah: midpoint(solar.trueSunset, solar.nextTrueSunrise)
		};
		const times = {};
		for (const [id, instant] of Object.entries(rawTimes)) {
			times[id] = roundZman(instant, ZMAN_ROUNDING[id] || "down");
		}
		return {
			opinion: boundaries.opinion,
			shaahMillis,
			dayStart: boundaries.start,
			dayEnd: boundaries.end,
			times
		};
	}
}
