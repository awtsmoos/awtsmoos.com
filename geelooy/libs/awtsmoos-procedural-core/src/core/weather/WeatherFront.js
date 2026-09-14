//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherFront.js
 * @description Models a moving regional front or storm cell as renderer-neutral spatial influence.
 * A front occupies real world coordinates so a player may leave rain, enter sunlight, or approach a distant storm.
 */

import { clampWeather, smoothWeather, weatherDistanceSquared } from "./WeatherMath.js";

/** Creates an immutable moving weather front with bounded physical descriptors. */
export function createWeatherFront(input = {}) {
	return Object.freeze({
		id: String(input.id || "weather-front"),
		origin: Object.freeze({ x: Number(input.x || 0), z: Number(input.z || 0) }),
		velocity: Object.freeze({ x: Number(input.velocityX || 0), z: Number(input.velocityZ || 0) }),
		radiusMeters: clampWeather(input.radiusMeters ?? 6000, 50, 500000),
		edgeMeters: clampWeather(input.edgeMeters ?? 1200, 1, 100000),
		cloudBoost: clampWeather(input.cloudBoost ?? 0.6, -1, 1),
		precipitationRate: clampWeather(input.precipitationRate ?? 0, 0, 500),
		temperatureDeltaC: clampWeather(input.temperatureDeltaC ?? 0, -40, 40),
		pressureDeltaHpa: clampWeather(input.pressureDeltaHpa ?? -4, -100, 100),
		windBoost: clampWeather(input.windBoost ?? 2, -100, 100),
		lightningActivity: clampWeather(input.lightningActivity ?? 0, 0, 1),
		instability: clampWeather(input.instability ?? 0.25, 0, 1),
		windShear: clampWeather(input.windShear ?? 0.2, 0, 1),
		convective: Boolean(input.convective)
	});
}

/** Returns the front center after deterministic translation through world time. */
export function weatherFrontCenter(front, timeSeconds = 0) {
	return Object.freeze({
		x: front.origin.x + front.velocity.x * Number(timeSeconds || 0),
		z: front.origin.z + front.velocity.z * Number(timeSeconds || 0)
	});
}

/** Samples one front at a world point and returns a normalized influence weight plus center. */
export function sampleWeatherFront(front, point, timeSeconds = 0) {
	const center = weatherFrontCenter(front, timeSeconds);
	const distance = Math.sqrt(weatherDistanceSquared(center, point));
	const inner = Math.max(0, front.radiusMeters - front.edgeMeters);
	const weight = 1 - smoothWeather(inner, front.radiusMeters, distance);
	return Object.freeze({
		front,
		center,
		distanceMeters: distance,
		weight: clampWeather(weight, 0, 1)
	});
}
