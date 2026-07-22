// B"H
// Boruch Hashem
// Blessed is He
/** Botanical realism evidence proves growth, season, wind, material, and LOD artifacts. */
import assert from "node:assert/strict";
import { listBotanicalSpecies } from "../src/index.js";
import { generateRealisticBotanicalPlant } from "../src/core/geometry/generators/botany/BotanicalRealism.js";

const species = listBotanicalSpecies()[0];
const input = { species, quality: "low", seed: 927, growth: 0.7, season: "autumn", wind: [2, 0.2, -0.5] };
const first = generateRealisticBotanicalPlant(input);
const second = generateRealisticBotanicalPlant(input);
assert.deepEqual(first, second);
assert.equal(first.speciesId, species);
assert.equal(first.realism.organs.length, first.parts.length);
assert.equal(first.realism.lods.length, 4);
assert.equal(first.realism.seasonalMaterial.chlorophyll, 0.42);
assert.ok(first.realism.organs.some(organ => organ.emergence > 0));
assert.ok(first.realism.windSkeleton.some(entry => Math.hypot(...entry.response) > 0));
assert.equal(first.realism.materialHints.thinSurface, true);
console.log('B"H | botanicalRealism.test passed');
