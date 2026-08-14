//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos bends no law when dawn and dusk cross the sky;
 * Awtsmoos.com resolves each solar threshold, or says plainly when none lies nigh.
 */

import { OhrSolarEquations } from "./solar-equations.js";

const MINUTE_MS = 60000;

/** Shift an ISO calendar date without borrowing the browser timezone. */
export function addIsoDays(isoDate, dayDelta) {
	const [year, month, day] = isoDate.split("-").map(Number);
	const shifted = new Date(Date.UTC(year, month - 1, day + dayDelta));
	return shifted.toISOString().slice(0, 10);
}

/** Compute solar events from published NOAA-style equations. */
export class ChochmahSolarEvents {
	/** Resolve one morning or evening crossing of a target solar-center altitude. */
	static eventAt(isoDate, latitude, longitude, altitude, direction) {
		const firstTerms = OhrSolarEquations.solarTerms(isoDate);
		const firstMinutes = this.eventMinutes(latitude, longitude, altitude, direction, firstTerms);
		if (firstMinutes === null) {
			return null;
		}
		const refinedTerms = OhrSolarEquations.solarTerms(isoDate, firstMinutes);
		const refinedMinutes = this.eventMinutes(latitude, longitude, altitude, direction, refinedTerms);
		return this.dateFromUtcMinutes(isoDate, refinedMinutes ?? firstMinutes);
	}

	/** Return astronomical solar noon for the longitude and date. */
	static solarNoon(isoDate, longitude) {
		const firstTerms = OhrSolarEquations.solarTerms(isoDate);
		const firstMinutes = 720 - 4 * longitude - firstTerms.equationMinutes;
		const refinedTerms = OhrSolarEquations.solarTerms(isoDate, firstMinutes);
		const refinedMinutes = 720 - 4 * longitude - refinedTerms.equationMinutes;
		return this.dateFromUtcMinutes(isoDate, refinedMinutes);
	}

	/** Calculate all solar anchors required by the halachic layer. */
	static forDate(isoDate, location) {
		const { latitude, longitude } = location;
		const nextDate = addIsoDays(isoDate, 1);
		return {
			alos: this.eventAt(isoDate, latitude, longitude, -16.9, "morning"),
			misheyakir: this.eventAt(isoDate, latitude, longitude, -10.2, "morning"),
			sunrise: this.eventAt(isoDate, latitude, longitude, -0.833, "morning"),
			trueSunrise: this.eventAt(isoDate, latitude, longitude, -1.583, "morning"),
			solarNoon: this.solarNoon(isoDate, longitude),
			trueSunset: this.eventAt(isoDate, latitude, longitude, -1.583, "evening"),
			sunset: this.eventAt(isoDate, latitude, longitude, -0.833, "evening"),
			tzeis: this.eventAt(isoDate, latitude, longitude, -6, "evening"),
			shabbosEnd: this.eventAt(isoDate, latitude, longitude, -8.5, "evening"),
			nextTrueSunrise: this.eventAt(nextDate, latitude, longitude, -1.583, "morning")
		};
	}

	/** Convert a solar geometry solution into minutes after UTC midnight. */
	static eventMinutes(latitude, longitude, altitude, direction, terms) {
		const angle = OhrSolarEquations.hourAngleDegrees(latitude, altitude, terms.declinationRadians);
		if (angle === null) {
			return null;
		}
		const signedAngle = direction === "morning" ? angle : -angle;
		return 720 - 4 * (longitude + signedAngle) - terms.equationMinutes;
	}

	/** Turn arbitrary UTC minutes, including values beyond one day, into an instant. */
	static dateFromUtcMinutes(isoDate, utcMinutes) {
		const [year, month, day] = isoDate.split("-").map(Number);
		return new Date(Date.UTC(year, month - 1, day) + utcMinutes * MINUTE_MS);
	}
}
