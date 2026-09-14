//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherCloudLayers.js
 * @description Converts one atmospheric sample into a compact multi-altitude cloud-layer plan.
 * Layer descriptors remain renderer-neutral so low-end cards, volumetric clouds, offline exporters, and future renderers can share the same sky truth.
 */

import { clampWeather } from "./WeatherMath.js";

/** Creates one immutable cloud layer descriptor. */
function cloudLayer(id, baseMeters, thicknessMeters, coverage, density, kind) {
	return Object.freeze({
		id,
		baseMeters,
		thicknessMeters,
		coverage: clampWeather(coverage, 0, 1),
		density: clampWeather(density, 0, 1),
		kind
	});
}

/** Derives low, convective, middle, and high cloud layers from one weather state. */
export function createWeatherCloudLayers(state = {}) {
	const cloudCover = clampWeather(state.cloudCover ?? 0, 0, 1);
	const humidity = clampWeather(state.humidity ?? 0, 0, 1);
	const instability = clampWeather(state.instability ?? 0, 0, 1);
	const baseMeters = Math.max(0, Number(state.cloudBaseMeters || 1800));
	const layers = [];
	if (cloudCover > 0.08) {
		layers.push(cloudLayer("low", baseMeters, 450 + humidity * 1100, cloudCover, 0.3 + humidity * 0.55, "cumulus"));
	}
	if (instability > 0.45 && cloudCover > 0.45) {
		layers.push(cloudLayer(
			"convective",
			baseMeters,
			1800 + instability * 7500,
			cloudCover * instability,
			0.55 + instability * 0.4,
			"cumulonimbus"
		));
	}
	if (cloudCover > 0.35) {
		layers.push(cloudLayer("middle", 3500, 1200, cloudCover * 0.55, 0.28 + humidity * 0.35, "altostratus"));
	}
	if (cloudCover > 0.15 || humidity > 0.55) {
		layers.push(cloudLayer("high", 8500, 1400, Math.max(cloudCover * 0.35, humidity * 0.2), 0.2, "cirrus"));
	}
	return Object.freeze(layers);
}

/** Returns aggregate sunlight transmission from planned cloud layers. */
export function weatherCloudTransmission(layers = []) {
	let transmission = 1;
	for (const layer of layers) {
		transmission *= 1 - clampWeather(layer.coverage * layer.density * 0.72, 0, 0.92);
	}
	return clampWeather(transmission, 0.04, 1);
}
