//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherSurfaceMemory.js
 * @description Integrates persistent ground consequences of weather without storing individual drops or flakes.
 * Wetness, mud, snow, frost, and retained water become compact environmental memory shared by materials, movement, hydrology, and ecology.
 */

import { clampWeather } from "./WeatherMath.js";
import { createWeatherState } from "./WeatherState.js";

/** Creates a bounded immutable surface-memory record. */
export function createWeatherSurfaceMemory(input = {}) {
	return Object.freeze({
		wetness: clampWeather(input.wetness ?? 0, 0, 1),
		mud: clampWeather(input.mud ?? 0, 0, 1),
		snowDepthMeters: clampWeather(input.snowDepthMeters ?? 0, 0, 20),
		frost: clampWeather(input.frost ?? 0, 0, 1),
		standingWaterMm: clampWeather(input.standingWaterMm ?? 0, 0, 1000),
		soilMoisture: clampWeather(input.soilMoisture ?? 0.4, 0, 1)
	});
}

/** Steps compact surface memory using atmosphere, drainage, exposure, and elapsed simulation time. */
export function stepWeatherSurfaceMemory(previousInput, atmosphereInput, options = {}) {
	const previous = createWeatherSurfaceMemory(previousInput);
	const weather = createWeatherState(atmosphereInput);
	const seconds = clampWeather(options.deltaSeconds ?? 1, 0, 86400);
	const hours = seconds / 3600;
	const drainage = clampWeather(options.drainage ?? 0.5, 0, 1);
	const sun = clampWeather(options.sunExposure ?? 0.5, 0, 1);
	const shelter = clampWeather(options.shelter ?? 0, 0, 1);
	const precipitation = weather.precipitation.rateMmPerHour * hours * (1 - shelter);
	const snowIncoming = weather.precipitation.kind === "snow" ? precipitation * 0.01 : 0;
	const rainIncoming = weather.precipitation.kind === "snow" ? 0 : precipitation;
	const meltRate = Math.max(0, weather.temperatureC) * (0.00012 + sun * 0.00018) * seconds;
	const snowDepthMeters = clampWeather(
		previous.snowDepthMeters + snowIncoming - meltRate,
		0,
		20
	);
	const meltWaterMm = Math.max(0, previous.snowDepthMeters + snowIncoming - snowDepthMeters) * 1000;
	const liquidInputMm = rainIncoming + meltWaterMm;
	const evaporation = Math.max(0, weather.temperatureC + 5)
		* (0.000004 + sun * 0.000006)
		* seconds
		* (1 - weather.humidity * 0.7);
	const standingWaterMm = clampWeather(
		previous.standingWaterMm + liquidInputMm * (1 - drainage) - evaporation * 2,
		0,
		1000
	);
	const soilMoisture = clampWeather(
		previous.soilMoisture + liquidInputMm * 0.0025 * drainage - evaporation * 0.002,
		0,
		1
	);
	const wetness = clampWeather(previous.wetness + liquidInputMm * 0.03 - evaporation * 0.02, 0, 1);
	const mud = clampWeather(previous.mud + wetness * soilMoisture * hours * 0.1 - hours * 0.015, 0, 1);
	const frostTarget = weather.temperatureC < 0 && weather.humidity > 0.65 ? 1 : 0;
	const frost = clampWeather(previous.frost + (frostTarget - previous.frost) * Math.min(1, hours * 0.4), 0, 1);
	return createWeatherSurfaceMemory({ wetness, mud, snowDepthMeters, frost, standingWaterMm, soilMoisture });
}
