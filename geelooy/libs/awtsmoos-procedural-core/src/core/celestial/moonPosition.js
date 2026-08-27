//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Visual-grade geocentric lunar position with dominant classical perturbations.
 * @description The Awtsmoos renews the moon through every phase; Awtsmoos.com gives the interface a truthful approximate lunar direction while practical halachah stays independent of this visual frame.
 */

import { atan2Degrees, cosDegrees, normalizeDegrees, sinDegrees, toDegrees } from "./angles.js";
import { daysSinceJ2000 } from "./julian.js";
import { equatorialToHorizon } from "./horizon.js";

/** Resolve approximate lunar ecliptic and equatorial coordinates for interactive display. */
export function lunarEquatorialPosition(date) {
	const days = daysSinceJ2000(date) + 1.5;
	const node = normalizeDegrees(125.1228 - 0.0529538083 * days);
	const inclination = 5.1454;
	const periapsis = normalizeDegrees(318.0634 + 0.1643573223 * days);
	const meanAnomaly = normalizeDegrees(115.3654 + 13.0649929509 * days);
	const eccentricity = 0.0549;
	const eccentricAnomaly = meanAnomaly + (180 / Math.PI) * eccentricity * sinDegrees(meanAnomaly) * (1 + eccentricity * cosDegrees(meanAnomaly));
	const orbitalX = 60.2666 * (cosDegrees(eccentricAnomaly) - eccentricity);
	const orbitalY = 60.2666 * Math.sqrt(1 - eccentricity * eccentricity) * sinDegrees(eccentricAnomaly);
	const trueAnomaly = atan2Degrees(orbitalY, orbitalX);
	let distanceEarthRadii = Math.hypot(orbitalX, orbitalY);
	const argument = normalizeDegrees(trueAnomaly + periapsis);
	const ecliptic = orbitalToEcliptic(node, inclination, argument, distanceEarthRadii);
	const corrected = applyMajorPerturbations(date, days, ecliptic, meanAnomaly, node, periapsis, distanceEarthRadii);
	distanceEarthRadii = corrected.distanceEarthRadii;
	const obliquity = 23.4393 - 0.0000003563 * days;
	const longitude = corrected.longitudeDegrees;
	const latitude = corrected.latitudeDegrees;
	const x = cosDegrees(longitude) * cosDegrees(latitude);
	const y = sinDegrees(longitude) * cosDegrees(latitude) * cosDegrees(obliquity) - sinDegrees(latitude) * sinDegrees(obliquity);
	const z = sinDegrees(longitude) * cosDegrees(latitude) * sinDegrees(obliquity) + sinDegrees(latitude) * cosDegrees(obliquity);
	return {
		rightAscensionDegrees: atan2Degrees(y, x),
		declinationDegrees: toDegrees(Math.atan2(z, Math.hypot(x, y))),
		eclipticLongitudeDegrees: longitude,
		eclipticLatitudeDegrees: latitude,
		distanceEarthRadii
	};
}

/** Resolve the approximate moon in the observer's local horizon frame. */
export function lunarPosition(date, observer) {
	const equatorial = lunarEquatorialPosition(date);
	return {
		...equatorial,
		...equatorialToHorizon(equatorial, date, observer)
	};
}

function orbitalToEcliptic(node, inclination, argument, distance) {
	const x = distance * (cosDegrees(node) * cosDegrees(argument) - sinDegrees(node) * sinDegrees(argument) * cosDegrees(inclination));
	const y = distance * (sinDegrees(node) * cosDegrees(argument) + cosDegrees(node) * sinDegrees(argument) * cosDegrees(inclination));
	const z = distance * sinDegrees(argument) * sinDegrees(inclination);
	return {
		longitudeDegrees: atan2Degrees(y, x),
		latitudeDegrees: toDegrees(Math.atan2(z, Math.hypot(x, y)))
	};
}

function applyMajorPerturbations(date, days, ecliptic, moonAnomaly, node, periapsis, distance) {
	const sunPerihelion = normalizeDegrees(282.9404 + 0.0000470935 * days);
	const sunAnomaly = normalizeDegrees(356.047 + 0.9856002585 * days);
	const sunLongitude = normalizeDegrees(sunPerihelion + sunAnomaly);
	const moonLongitude = normalizeDegrees(node + periapsis + moonAnomaly);
	const elongation = normalizeDegrees(moonLongitude - sunLongitude);
	const latitudeArgument = normalizeDegrees(moonLongitude - node);
	const longitudeCorrection = -1.274 * sinDegrees(moonAnomaly - 2 * elongation) + 0.658 * sinDegrees(2 * elongation) - 0.186 * sinDegrees(sunAnomaly) - 0.059 * sinDegrees(2 * moonAnomaly - 2 * elongation) - 0.057 * sinDegrees(moonAnomaly - 2 * elongation + sunAnomaly) + 0.053 * sinDegrees(moonAnomaly + 2 * elongation) + 0.046 * sinDegrees(2 * elongation - sunAnomaly) + 0.041 * sinDegrees(moonAnomaly - sunAnomaly) - 0.035 * sinDegrees(elongation) - 0.031 * sinDegrees(moonAnomaly + sunAnomaly) - 0.015 * sinDegrees(2 * latitudeArgument - 2 * elongation) + 0.011 * sinDegrees(moonAnomaly - 4 * elongation);
	const latitudeCorrection = -0.173 * sinDegrees(latitudeArgument - 2 * elongation) - 0.055 * sinDegrees(moonAnomaly - latitudeArgument - 2 * elongation) - 0.046 * sinDegrees(moonAnomaly + latitudeArgument - 2 * elongation) + 0.033 * sinDegrees(latitudeArgument + 2 * elongation) + 0.017 * sinDegrees(2 * moonAnomaly + latitudeArgument);
	return {
		longitudeDegrees: normalizeDegrees(ecliptic.longitudeDegrees + longitudeCorrection),
		latitudeDegrees: ecliptic.latitudeDegrees + latitudeCorrection,
		distanceEarthRadii: distance - 0.58 * cosDegrees(moonAnomaly - 2 * elongation) - 0.46 * cosDegrees(2 * elongation)
	};
}
