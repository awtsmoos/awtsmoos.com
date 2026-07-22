// B"H
// Boruch Hashem
// Blessed is He
/** Botanical evidence proves deterministic phyllotaxis and explicit flower anatomy. */

import assert from "node:assert/strict";
import {
	BOTANICAL_GOLDEN_ANGLE,
	createBotanicalPhyllotaxis,
	getBotanicalSpecies,
	listBotanicalSpecies,
	planBotanicalFlowerOrgans
} from "../src/exports/vegetation.js";

const first = createBotanicalPhyllotaxis({
	count: 12,
	radius: 2,
	phase: 0.2
});
const second = createBotanicalPhyllotaxis({
	count: 12,
	radius: 2,
	phase: 0.2
});
assert.deepEqual(first, second);
assert.equal(first.length, 12);
assert.ok(
	Math.abs(first[1].angle - first[0].angle - BOTANICAL_GOLDEN_ANGLE) < 1e-12
);
assert.ok(first.every(point => (
	Number.isFinite(point.x) && Number.isFinite(point.z)
)));

const species = getBotanicalSpecies(listBotanicalSpecies()[0]);
const organs = planBotanicalFlowerOrgans({
	species,
	quality: "high",
	spread: 1.2
});
assert.ok(organs.counts.sepals >= 3);
assert.ok(organs.counts.petals >= 3);
assert.ok(organs.counts.stamens >= 4);
assert.equal(organs.counts.pistils, 1);
const all = [
	...organs.sepals,
	...organs.petals,
	...organs.stamens,
	...organs.pistil
];
assert.equal(new Set(all.map(organ => organ.id)).size, all.length);
assert.ok(all.every(organ => Number.isFinite(organ.scale)));

console.log('B"H | botanicalFlowerOrgans.test passed');
