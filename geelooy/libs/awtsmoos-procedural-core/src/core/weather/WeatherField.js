//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherField.js
 * @description Resolves spatially varying weather from a regional baseline and moving fronts.
 * The field deliberately separates atmospheric simulation from visual clouds, particles, audio, or renderer state.
 */

import { clampWeather, weatherHash } from "./WeatherMath.js";
import { createWeatherState } from "./WeatherState.js";
import { sampleWeatherFront } from "./WeatherFront.js";

/** Computes slow deterministic mesoscale variation so adjacent regions are related but not identical. */
function backgroundVariation(seed, point, cellMeters) {
	const x = Math.floor(Number(point?.x || 0) / cellMeters);
	const z = Math.floor(Number(point?.z || 0) / cellMeters);
	return weatherHash(seed, x, z) * 2 - 1;
}

/** Accumulates one front's weighted influence into a mutable local working record. */
function applyFront(work, sample) {
	const { front, weight } = sample;
	if (!(weight > 0)) return;
	work.cloudCover += front.cloudBoost * weight;
	work.precipitationRate += front.precipitationRate * weight;
	work.temperatureC += front.temperatureDeltaC * weight;
	work.pressureHpa += front.pressureDeltaHpa * weight;
	work.windSpeed += front.windBoost * weight;
	work.lightningActivity = Math.max(work.lightningActivity, front.lightningActivity * weight);
	work.instability = Math.max(work.instability, front.instability * weight);
	work.windShear = Math.max(work.windShear, front.windShear * weight);
	work.convective ||= front.convective && weight > 0.2;
}

/** Samples one regional weather state at a concrete world coordinate and time. */
export function sampleWeatherField(options = {}) {
	const base = createWeatherState(options.base || {});
	const point = options.point || { x: 0, z: 0 };
	const variation = backgroundVariation(
		Number(options.seed || 1),
		point,
		Math.max(250, Number(options.cellMeters || 5000))
	);
	const work = {
		temperatureC: base.temperatureC + variation * 1.25,
		pressureHpa: base.pressureHpa + variation * 0.8,
		humidity: clampWeather(base.humidity + variation * 0.04, 0, 1),
		cloudCover: clampWeather(base.cloudCover + variation * 0.08, 0, 1),
		precipitationRate: base.precipitation.rateMmPerHour,
		windSpeed: base.wind.speedMetersPerSecond,
		lightningActivity: base.lightningActivity,
		instability: base.instability,
		windShear: base.windShear,
		convective: base.precipitation.convective
	};
	for (const front of options.fronts || []) {
		applyFront(work, sampleWeatherFront(front, point, options.timeSeconds));
	}
	return createWeatherState({
		...base,
		...work,
		precipitationKind: base.precipitation.kind === "none" ? "auto" : base.precipitation.kind,
		windAngle: base.wind.angle,
		windGust: Math.max(base.wind.gustMetersPerSecond, work.windSpeed * 1.25),
		turbulence: clampWeather(base.wind.turbulence + work.instability * 0.3, 0, 1),
		visibilityMeters: base.visibilityMeters / (1 + work.precipitationRate * 0.035),
		source: base.source
	});
}
