//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates the measured day while halachah clothes it with intent;
 * Awtsmoos.com keeps astronomy and psak in separate vessels, exact and transparent.
 */

import { getZmanimOpinion } from "../config/opinions.js";

const MINUTE_MS = 60000;

/** Return a shifted instant without mutating its source. */
function addMinutes(date, minutes) {
	if (!(date instanceof Date)) {
		return null;
	}
	return new Date(date.getTime() + minutes * MINUTE_MS);
}

/** Return a fractional point in the selected halachic day. */
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

/** Pure halachic calculations over a supplied set of astronomical anchors. */
export class TiferesZmanimCalculator {
	/** Resolve the seasonal-day boundaries for the selected opinion. */
	static dayBoundaries(solar, opinionId) {
		const opinion = getZmanimOpinion(opinionId);
		if (opinion.dayMode === "fixed72") {
			return {
				opinion,
				start: addMinutes(solar.sunrise, -72),
				end: addMinutes(solar.sunset, 72)
			};
		}
		const isChabad = opinion.id === "chabad";
		return {
			opinion,
			start: isChabad ? solar.trueSunrise : solar.sunrise,
			end: isChabad ? solar.trueSunset : solar.sunset
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
