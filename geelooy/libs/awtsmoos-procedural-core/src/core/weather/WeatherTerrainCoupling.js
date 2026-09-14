//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherTerrainCoupling.js
 * @description Applies elevation, terrain lift, rain-shadow tendency, and shelter to one atmospheric sample.
 * Mountains and structures influence local weather through plain numeric fields so renderers, games, and servers share one causality model.
 */

import { clampWeather } from "./WeatherMath.js";
import { createWeatherState } from "./WeatherState.js";
import { weatherTemperatureAtElevation } from "./WeatherVerticalProfile.js";

/** Returns normalized horizontal terrain ascent direction and gradient magnitude. */
function slopeData(terrain = {}) {
	const gradient = terrain.slopeGradient || [0, 0];
	const x = Number(gradient[0] || 0);
	const z = Number(gradient[1] || 0);
	const magnitude = Math.hypot(x, z);
	return {
		direction: magnitude > 0 ? [x / magnitude, z / magnitude] : [0, 0],
		magnitude: clampWeather(magnitude, 0, 2)
	};
}

/** Computes signed orographic lift from incoming horizontal wind and terrain ascent. */
export function weatherOrographicLift(state, terrain = {}) {
	const slope = slopeData(terrain);
	const wind = state.wind?.direction || [1, 0];
	const alignment = Number(wind[0] || 0) * slope.direction[0] + Number(wind[1] || 0) * slope.direction[1];
	return clampWeather(alignment * slope.magnitude, -1, 1);
}

/** Applies local terrain effects while preserving the canonical weather-state schema. */
export function coupleWeatherToTerrain(state, terrain = {}, options = {}) {
	const elevationMeters = Number(terrain.elevationMeters || 0);
	const lift = weatherOrographicLift(state, terrain);
	const shelter = clampWeather(terrain.shelter ?? 0, 0, 1);
	const precipitationRate = Number(state.precipitation?.rateMmPerHour || 0);
	const humidity = clampWeather(Number(state.humidity || 0) + lift * 0.12, 0, 1);
	const precipitationMultiplier = clampWeather(1 + lift * 0.65, 0.15, 1.9);
	const windSpeed = Number(state.wind?.speedMetersPerSecond || 0) * (1 - shelter * 0.78);
	const windGust = Math.max(
		windSpeed,
		Number(state.wind?.gustMetersPerSecond || windSpeed) * (1 - shelter * 0.58)
	);
	return createWeatherState({
		...state,
		temperatureC: weatherTemperatureAtElevation(state, elevationMeters, options),
		humidity,
		cloudCover: clampWeather(Number(state.cloudCover || 0) + Math.max(0, lift) * 0.18, 0, 1),
		precipitationRate: precipitationRate * precipitationMultiplier,
		precipitationKind: "auto",
		windAngle: state.wind?.angle,
		windSpeed,
		windGust,
		turbulence: clampWeather(Number(state.wind?.turbulence || 0) + Math.abs(lift) * 0.12, 0, 1),
		fogDensity: clampWeather(Number(state.fogDensity || 0) + Math.max(0, lift) * humidity * 0.2, 0, 1),
		source: `${state.source || "weather"}:terrain`
	});
}
