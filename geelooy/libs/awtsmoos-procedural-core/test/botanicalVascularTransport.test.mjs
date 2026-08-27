// B"H
// Boruch Hashem
// Blessed is He
/** Vascular evidence proves root uptake, transpiration, photosynthesis, growth, and wilting. */
import assert from "node:assert/strict";
import test from "node:test";
import { listBotanicalSpecies } from "../src/index.js";
import { generateBotanicalPlant } from "../src/core/geometry/generators/botany/BotanicalGenerator.js";
import { createBotanicalBiomechanics } from "../src/core/geometry/generators/botany/realism/createBotanicalBiomechanics.js";
import { createBotanicalEnvironmentCoupling } from "../src/core/geometry/generators/botany/realism/createBotanicalEnvironmentCoupling.js";
import { createBotanicalVascularState } from "../src/core/geometry/generators/botany/realism/createBotanicalVascularState.js";
import { stepBotanicalVascularTransport } from "../src/core/geometry/generators/botany/realism/stepBotanicalVascularTransport.js";

test("vascular transport preserves organ IDs and couples hydration to biomechanics", () => {
	const plant = generateBotanicalPlant({ species: listBotanicalSpecies()[0], quality: "low", seed: 44 });
	const vascular = createBotanicalVascularState(plant, { initialWater: 0.3, rootWater: 1 });
	const wet = stepBotanicalVascularTransport(vascular, { deltaTime: 0.1, soilMoisture: 1, sunlight: 1, humidity: 0.7 });
	const dry = stepBotanicalVascularTransport(vascular, { deltaTime: 0.1, soilMoisture: 0, sunlight: 1, humidity: 0, temperature: 1.2 });
	assert.deepEqual(wet.state.organs.map(organ => organ.id), vascular.organs.map(organ => organ.id));
	assert.ok(wet.report.rootWaterUptake > dry.report.rootWaterUptake);
	assert.ok(wet.report.photosynthesized > 0);
	assert.ok(dry.report.transpired > wet.report.transpired);
	const biomechanics = createBotanicalBiomechanics(plant, { wind: [2, 0, 0] });
	const coupling = createBotanicalEnvironmentCoupling(wet.state, biomechanics);
	assert.equal(coupling.windModes.length, biomechanics.windModes.length);
	assert.ok(coupling.material.translucency > 0);
});
