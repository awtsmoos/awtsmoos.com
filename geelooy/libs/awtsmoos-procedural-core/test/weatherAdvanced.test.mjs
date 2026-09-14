//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file weatherAdvanced.test.mjs
 * @description Verifies mountain lapse, orographic rain, shelter, cloud layering, deterministic lightning/thunder, and non-mutating forecasts.
 * Advanced weather must remain coherent, bounded, deterministic, and renderer-neutral across the same world clock.
 */

import assert from "node:assert/strict";
import {
	WeatherSimulator,
	coupleWeatherToTerrain,
	createWeatherCloudLayers,
	createWeatherFront,
	createWeatherLightningEvent,
	createWeatherState,
	createWeatherVerticalProfile,
	forecastWeatherTimeline,
	weatherCloudTransmission,
	weatherSnowLineMeters,
	weatherThunderArrivalSeconds
} from "../src/core/weather/index.js";

const storm = createWeatherState({
	temperatureC: 5,
	cloudCover: 0.88,
	humidity: 0.85,
	precipitationRate: 12,
	windAngle: 0,
	windSpeed: 12,
	windGust: 20,
	lightningActivity: 1,
	instability: 0.8,
	windShear: 0.65
});

const low = createWeatherVerticalProfile(storm, 0);
const summit = createWeatherVerticalProfile(storm, 1800);
assert.ok(summit.temperatureC < low.temperatureC);
assert.ok(summit.pressureHpa < low.pressureHpa);
assert.ok(["mixed", "snow"].includes(summit.precipitationKind));
assert.ok(weatherSnowLineMeters(storm) > 0);

const windward = coupleWeatherToTerrain(storm, {
	elevationMeters: 600,
	slopeGradient: [0.7, 0],
	shelter: 0
});
const leeward = coupleWeatherToTerrain(storm, {
	elevationMeters: 600,
	slopeGradient: [-0.7, 0],
	shelter: 0.8
});

assert.ok(windward.precipitation.rateMmPerHour > leeward.precipitation.rateMmPerHour);
assert.ok(leeward.wind.speedMetersPerSecond < windward.wind.speedMetersPerSecond);

const layers = createWeatherCloudLayers(windward);
assert.ok(layers.length >= 2);
assert.ok(layers.some(layer => layer.kind === "cumulonimbus"));
assert.ok(weatherCloudTransmission(layers) < 1);

let lightning = null;
for (let timeSeconds = 0; timeSeconds < 120 && !lightning; timeSeconds += 3) {
	lightning = createWeatherLightningEvent(storm, {
		seed: 77,
		timeSeconds,
		center: { x: 0, z: 0 },
		observer: { x: 1000, z: 0 },
		radiusMeters: 2500
	});
}

assert.ok(lightning, "an activity=1 storm should yield a deterministic strike opportunity");
assert.ok(lightning.thunderDelaySeconds >= 0);
assert.equal(
	weatherThunderArrivalSeconds(lightning, 10),
	10 + lightning.thunderDelaySeconds
);

const simulator = new WeatherSimulator({
	seed: 44,
	base: storm,
	fronts: [createWeatherFront({
		x: -1000,
		z: 0,
		velocityX: 10,
		radiusMeters: 1500,
		precipitationRate: 25,
		cloudBoost: 0.3
	})]
});

const beforeTime = simulator.timeSeconds;
const forecast = forecastWeatherTimeline(simulator, { x: 0, z: 0 }, [0, 60, 180]);
assert.equal(forecast.length, 3);
assert.equal(simulator.timeSeconds, beforeTime, "forecasting must not mutate the live world clock");
assert.equal(forecast[0].state.source, simulator.sample({ x: 0, z: 0 }).source);
assert.ok(forecast.every(entry => Number.isFinite(entry.state.temperatureC)));

console.log('B"H | weatherAdvanced.test.mjs passed');
