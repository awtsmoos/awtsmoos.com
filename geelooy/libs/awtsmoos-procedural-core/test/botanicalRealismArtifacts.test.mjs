// B"H
import test from "node:test";
import assert from "node:assert/strict";
import { generateBotanicalPlant } from "../src/core/geometry/generators/botany/BotanicalGenerator.js";
import { createBotanicalRealismArtifacts } from "../src/core/geometry/generators/botany/realism/index.js";

function daisy() {
	return generateBotanicalPlant({ species: "daisy", seed: 613, quality: "high" });
}

test("botanical realism adds mechanics, physiology, optics, and reproduction", () => {
	const plant = daisy();
	const realism = createBotanicalRealismArtifacts(plant, {
		physiology: { light: 0.9, hydration: 0.8, temperatureCelsius: 23 },
		reproduction: { pollenCount: 128 }
	});
	assert.equal(realism.sourceSpeciesId, plant.speciesId);
	assert.ok(realism.biomechanics.windModes.length >= 3);
	assert.ok(realism.physiology.photosynthesis > 0);
	assert.equal(realism.surfaces.length, plant.parts.length);
	assert.equal(realism.reproduction.pollen.length, 128);
	assert.equal(realism.reproduction.flowering, true);
	assert.ok(realism.capabilities.includes("pollen-emission"));
});

test("botanical realism is deterministic for equal generated plants", () => {
	const first = createBotanicalRealismArtifacts(daisy(), { reproduction: { pollenCount: 32 } });
	const second = createBotanicalRealismArtifacts(daisy(), { reproduction: { pollenCount: 32 } });
	assert.deepEqual(first, second);
	assert.ok(first.biomechanics.bounds.vertexCount > 0);
	assert.ok(first.physiology.stomataOpen >= 0);
	assert.ok(first.physiology.stomataOpen <= 1);
});
