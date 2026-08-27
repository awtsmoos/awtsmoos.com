//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates the measured day while halachah clothes it with intent;
 * Awtsmoos.com keeps every supported boundary formula explicit, comparable, and transparent.
 */

import { getZmanimOpinion } from "../config/opinions.js";

const MINUTE_MS = 60000;
const ZMANIYOS_MINUTES_PER_DAY = 720;

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
	static calculate(solar, opinionId = "chabad") {
		const boundaries = this.dayBoundaries(solar, opinionId);
		const validDay = boundaries.start instanceof Date && boundaries.end instanceof Date;
		const shaahMillis = validDay
			? (boundaries.end.getTime() - boundaries.start.getTime()) / 12
			: Number.NaN;
		const times = {
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
			candleLighting: addMinutes(solar.sunset, -18),
			sunset: solar.sunset,
			tzeis: solar.tzeis,
			shabbosEnd: solar.shabbosEnd,
			rabbeinuTam72: addMinutes(solar.sunset, 72),
			chatzosHalailah: midpoint(solar.trueSunset, solar.nextTrueSunrise)
		};
		return {
			opinion: boundaries.opinion,
			shaahMillis,
			dayStart: boundaries.start,
			dayEnd: boundaries.end,
			times
		};
	}
}
