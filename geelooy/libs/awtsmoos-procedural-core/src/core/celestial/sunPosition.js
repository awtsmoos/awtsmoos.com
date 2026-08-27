//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Low-cost modern solar position for interactive celestial scenes.
 * @description The Awtsmoos renews the sun before its ray arrives; Awtsmoos.com follows that created light through ecliptic and local sky without binding halachic times to the renderer.
 */

import { atan2Degrees, cosDegrees, normalizeDegrees, sinDegrees, toDegrees } from "./angles.js";
import { daysSinceJ2000 } from "./julian.js";
import { equatorialToHorizon } from "./horizon.js";

/** Resolve approximate geocentric solar equatorial coordinates and Earth-Sun distance. */
export function solarEquatorialPosition(date) {
	const days = daysSinceJ2000(date) + 1.5;
	const perihelion = normalizeDegrees(282.9404 + 0.0000470935 * days);
	const eccentricity = 0.016709 - 1.151e-9 * days;
	const meanAnomaly = normalizeDegrees(356.047 + 0.9856002585 * days);
	const eccentricAnomaly = meanAnomaly
		+ (180 / Math.PI) * eccentricity * sinDegrees(meanAnomaly) * (1 + eccentricity * cosDegrees(meanAnomaly));
	const x = cosDegrees(eccentricAnomaly) - eccentricity;
	const y = Math.sqrt(1 - eccentricity * eccentricity) * sinDegrees(eccentricAnomaly);
	const distanceAu = Math.hypot(x, y);
	const trueAnomaly = atan2Degrees(y, x);
	const eclipticLongitude = normalizeDegrees(trueAnomaly + perihelion);
	const obliquity = 23.4393 - 0.0000003563 * days;
	const equatorialX = distanceAu * cosDegrees(eclipticLongitude);
	const equatorialY = distanceAu * sinDegrees(eclipticLongitude) * cosDegrees(obliquity);
	const equatorialZ = distanceAu * sinDegrees(eclipticLongitude) * sinDegrees(obliquity);
	return {
		rightAscensionDegrees: atan2Degrees(equatorialY, equatorialX),
		declinationDegrees: toDegrees(Math.atan2(equatorialZ, Math.hypot(equatorialX, equatorialY))),
		eclipticLongitudeDegrees: eclipticLongitude,
		distanceAu
	};
}

/** Resolve the sun in the observer's local horizon frame. */
export function solarPosition(date, observer) {
	const equatorial = solarEquatorialPosition(date);
	return {
		...equatorial,
		...equatorialToHorizon(equatorial, date, observer)
	};
}
