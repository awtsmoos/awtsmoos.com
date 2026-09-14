//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherLightning.js
 * @description Generates deterministic lightning opportunities and observer-relative thunder timing from weather state.
 * Core emits semantic strike events only; renderers decide how to draw flashes while audio systems decide how to synthesize thunder.
 */

import { clampWeather, weatherHash } from "./WeatherMath.js";

/** Returns Euclidean horizontal distance in meters between two world points. */
function distanceMeters(left = {}, right = {}) {
	return Math.hypot(
		Number(left.x || 0) - Number(right.x || 0),
		Number(left.z || 0) - Number(right.z || 0)
	);
}

/** Generates a stable strike candidate for one integer lightning time bucket. */
export function createWeatherLightningEvent(state, options = {}) {
	const activity = clampWeather(state?.lightningActivity ?? 0, 0, 1);
	if (!(activity > 0.01)) return null;
	const bucketSeconds = clampWeather(options.bucketSeconds ?? 3, 0.25, 60);
	const bucket = Math.floor(Number(options.timeSeconds || 0) / bucketSeconds);
	const seed = Number(options.seed || 1);
	const chance = weatherHash(seed, bucket, 17);
	if (chance > activity * 0.72) return null;
	const center = options.center || { x: 0, z: 0 };
	const radiusMeters = clampWeather(options.radiusMeters ?? 4000, 20, 100000);
	const angle = weatherHash(seed ^ 0x45d9f3b, bucket, 29) * Math.PI * 2;
	const radius = Math.sqrt(weatherHash(seed ^ 0x7f4a7c15, bucket, 31)) * radiusMeters;
	const position = Object.freeze({
		x: Number(center.x || 0) + Math.cos(angle) * radius,
		z: Number(center.z || 0) + Math.sin(angle) * radius
	});
	const observer = options.observer || center;
	const distance = distanceMeters(position, observer);
	const strikeKindSample = weatherHash(seed ^ 0x27d4eb2d, bucket, 43);
	const kind = strikeKindSample < 0.22
		? "cloud-to-cloud"
		: strikeKindSample < 0.52
			? "intra-cloud"
			: "cloud-to-ground";
	return Object.freeze({
		id: `lightning.${bucket}.${Math.round(chance * 1e6)}`,
		bucket,
		kind,
		position,
		activity,
		intensity: clampWeather(activity * (0.7 + chance * 0.5), 0, 1),
		distanceToObserverMeters: distance,
		thunderDelaySeconds: distance / 343,
		flashDurationSeconds: 0.05 + activity * 0.12
	});
}

/** Returns thunder arrival world time for scheduling outside the renderer-neutral Core. */
export function weatherThunderArrivalSeconds(event, flashTimeSeconds = 0) {
	if (!event) return null;
	return Number(flashTimeSeconds || 0) + Number(event.thunderDelaySeconds || 0);
}
