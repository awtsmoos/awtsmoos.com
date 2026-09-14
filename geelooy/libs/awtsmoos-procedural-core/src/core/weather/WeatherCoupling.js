//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherCoupling.js
 * @description Translates atmosphere plus surface memory into neutral signals for water, vegetation, materials, audio, movement, and simulation.
 * The coupling contract prevents each subsystem from inventing its own incompatible concept of rain, wind, snow, or visibility.
 */

import { clampWeather } from "./WeatherMath.js";
import { classifyWeather, deriveWeatherHazards } from "./WeatherHazards.js";
import { createWeatherState } from "./WeatherState.js";
import { createWeatherSurfaceMemory } from "./WeatherSurfaceMemory.js";

/** Builds immutable cross-system environmental signals from one shared weather authority. */
export function createWeatherCoupling(atmosphereInput, surfaceInput = {}) {
	const weather = createWeatherState(atmosphereInput);
	const surface = createWeatherSurfaceMemory(surfaceInput);
	const hazards = deriveWeatherHazards(weather);
	return Object.freeze({
		regime: classifyWeather(weather),
		water: Object.freeze({
			precipitationMmPerHour: weather.precipitation.rateMmPerHour,
			snowMeltAvailableMeters: surface.snowDepthMeters,
			runoffPotential: clampWeather(surface.soilMoisture * 0.7 + surface.standingWaterMm / 100, 0, 1)
		}),
		vegetation: Object.freeze({
			windSpeedMetersPerSecond: weather.wind.speedMetersPerSecond,
			gustMetersPerSecond: weather.wind.gustMetersPerSecond,
			windDirection: weather.wind.direction,
			waterAvailability: surface.soilMoisture,
			snowLoad: clampWeather(surface.snowDepthMeters / 0.3, 0, 1),
			frost: surface.frost
		}),
		materials: Object.freeze({
			wetness: surface.wetness,
			snowCoverage: clampWeather(surface.snowDepthMeters / 0.05, 0, 1),
			mud: surface.mud,
			frost: surface.frost
		}),
		movement: Object.freeze({
			tractionLoss: clampWeather(surface.mud * 0.35 + surface.frost * 0.45, 0, 0.8),
			deepSnow: clampWeather(surface.snowDepthMeters / 0.25, 0, 1)
		}),
		atmosphere: Object.freeze({
			visibilityMeters: weather.visibilityMeters,
			cloudCover: weather.cloudCover,
			fogDensity: weather.fogDensity,
			lightningActivity: weather.lightningActivity
		}),
		audio: Object.freeze({
			rainIntensity: clampWeather(weather.precipitation.rateMmPerHour / 25, 0, 1),
			windIntensity: clampWeather(weather.wind.speedMetersPerSecond / 20, 0, 1),
			thunderActivity: weather.lightningActivity,
			snowDamping: clampWeather(surface.snowDepthMeters / 0.08, 0, 1)
		}),
		hazards
	});
}
