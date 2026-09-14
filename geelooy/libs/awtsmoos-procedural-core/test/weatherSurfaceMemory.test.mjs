//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file weatherSurfaceMemory.test.mjs
 * @description Proves that rain, snow, melt, mud, and coupling persist as compact environmental state instead of individual particles.
 */

import assert from "node:assert/strict";
import {
	createWeatherCoupling,
	createWeatherPreset,
	createWeatherSurfaceMemory,
	stepWeatherSurfaceMemory
} from "../src/core/weather/index.js";

let ground = createWeatherSurfaceMemory({ soilMoisture: 0.35 });
ground = stepWeatherSurfaceMemory(
	ground,
	createWeatherPreset("heavy-rain"),
	{ deltaSeconds: 3600, drainage: 0.25, sunExposure: 0.1 }
);
assert.ok(ground.wetness > 0.4);
assert.ok(ground.soilMoisture > 0.35);
assert.ok(ground.standingWaterMm > 0);

const rainyCoupling = createWeatherCoupling(createWeatherPreset("heavy-rain"), ground);
assert.ok(rainyCoupling.water.runoffPotential > 0);
assert.ok(rainyCoupling.materials.wetness > 0);
assert.ok(rainyCoupling.audio.rainIntensity > 0.5);

let snow = createWeatherSurfaceMemory();
snow = stepWeatherSurfaceMemory(
	snow,
	createWeatherPreset("blizzard"),
	{ deltaSeconds: 7200, drainage: 0.7, sunExposure: 0 }
);
assert.ok(snow.snowDepthMeters > 0);
const snowyCoupling = createWeatherCoupling(createWeatherPreset("blizzard"), snow);
assert.ok(snowyCoupling.vegetation.snowLoad > 0);
assert.ok(snowyCoupling.audio.snowDamping > 0);
assert.ok(snowyCoupling.movement.deepSnow > 0);

const melted = stepWeatherSurfaceMemory(
	snow,
	createWeatherPreset("sunny", { temperatureC: 12 }),
	{ deltaSeconds: 21600, drainage: 0.5, sunExposure: 1 }
);
assert.ok(melted.snowDepthMeters < snow.snowDepthMeters);
assert.ok(melted.soilMoisture >= snow.soilMoisture);

console.log('B"H | weatherSurfaceMemory.test.mjs passed');
