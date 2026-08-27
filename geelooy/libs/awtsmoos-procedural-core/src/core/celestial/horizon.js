//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Equatorial-to-horizon projection.
 * @description The Awtsmoos is equally present in every direction; Awtsmoos.com turns right ascension into the local altitude and azimuth a person can actually face.
 */

import { atan2Degrees, clamp, cosDegrees, normalizeDegrees, sinDegrees, toDegrees, toRadians } from "./angles.js";
import { julianCenturies, toJulianDay } from "./julian.js";

/** Greenwich mean sidereal time in degrees for a UTC instant. */
export function greenwichSiderealDegrees(date) {
	const julianDay = toJulianDay(date);
	const centuries = julianCenturies(date);
	return normalizeDegrees(
		280.46061837
		+ 360.98564736629 * (julianDay - 2451545)
		+ 0.000387933 * centuries * centuries
		- centuries * centuries * centuries / 38710000
	);
}

/** Convert equatorial coordinates into local horizon altitude and north-based azimuth. */
export function equatorialToHorizon(equatorial, date, observer) {
	const latitude = Number(observer.latitude);
	const longitude = Number(observer.longitude);
	const rightAscension = Number(equatorial.rightAscensionDegrees);
	const declination = Number(equatorial.declinationDegrees);
	const hourAngle = normalizeDegrees(greenwichSiderealDegrees(date) + longitude - rightAscension);
	const altitudeRadians = Math.asin(
		sinDegrees(latitude) * sinDegrees(declination)
		+ cosDegrees(latitude) * cosDegrees(declination) * cosDegrees(hourAngle)
	);
	const azimuth = atan2Degrees(
		sinDegrees(hourAngle),
		cosDegrees(hourAngle) * sinDegrees(latitude) - Math.tan(toRadians(declination)) * cosDegrees(latitude)
	);
	return {
		altitudeDegrees: toDegrees(altitudeRadians),
		azimuthDegrees: normalizeDegrees(azimuth + 180),
		hourAngleDegrees: hourAngle
	};
}

/** Project horizon coordinates into a panoramic normalized scene rectangle. */
export function projectHorizon(horizon) {
	return {
		x: normalizeDegrees(horizon.azimuthDegrees) / 360,
		y: 1 - (clamp(horizon.altitudeDegrees, -12, 90) + 12) / 102
	};
}
