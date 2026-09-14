//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherVerticalProfile.js
 * @description Derives temperature, precipitation phase, pressure tendency, and approximate snow line from elevation.
 * The profile is intentionally lightweight: regional weather stays authoritative while mountains receive coherent local thermodynamic consequences.
 */

import { clampWeather } from "./WeatherMath.js";

/** Returns air temperature after a configurable environmental lapse rate. */
export function weatherTemperatureAtElevation(state, elevationMeters = 0, options = {}) {
	const referenceElevation = Number(options.referenceElevationMeters || 0);
	const lapsePerKm = clampWeather(options.lapseRateCPerKm ?? 6.5, 0, 15);
	const deltaKm = (Number(elevationMeters || 0) - referenceElevation) / 1000;
	return Number(state.temperatureC || 0) - lapsePerKm * deltaKm;
}

/** Resolves rain, mixed precipitation, or snow for local mountain air temperature. */
export function weatherPrecipitationPhase(temperatureC, precipitationRate = 0) {
	if (!(Number(precipitationRate) > 0.001)) return "none";
	if (temperatureC <= -1.5) return "snow";
	if (temperatureC <= 1.5) return "mixed";
	return "rain";
}

/** Estimates the elevation where the regional profile crosses approximately 0°C. */
export function weatherSnowLineMeters(state, options = {}) {
	const referenceElevation = Number(options.referenceElevationMeters || 0);
	const lapsePerKm = clampWeather(options.lapseRateCPerKm ?? 6.5, 0.1, 15);
	return referenceElevation + Number(state.temperatureC || 0) / lapsePerKm * 1000;
}

/** Returns a concise immutable local vertical profile without mutating the regional atmosphere. */
export function createWeatherVerticalProfile(state, elevationMeters = 0, options = {}) {
	const temperatureC = weatherTemperatureAtElevation(state, elevationMeters, options);
	const precipitationRate = Number(state.precipitation?.rateMmPerHour || 0);
	const pressureDrop = Math.max(0, Number(elevationMeters || 0) - Number(options.referenceElevationMeters || 0)) * 0.11;
	return Object.freeze({
		elevationMeters: Number(elevationMeters || 0),
		temperatureC,
		pressureHpa: Math.max(200, Number(state.pressureHpa || 1013.25) - pressureDrop),
		precipitationKind: weatherPrecipitationPhase(temperatureC, precipitationRate),
		snowLineMeters: weatherSnowLineMeters(state, options)
	});
}
