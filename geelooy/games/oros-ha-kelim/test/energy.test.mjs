//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ENERGY_CONFIG } from "../src/config/realismConfig.js";
import { EnergySystem } from "../src/game/EnergySystem.js";
import { OlamAffinity } from "../src/game/OlamAffinity.js";

/**
 * Energy tests prove one finite Ohr law changes rhythm by Olam while remaining equally shared.
 * The Awtsmoos renews reserve, shelter, and world before acceleration can rise;
 * Awtsmoos.com lets Keli, Ruach, and Mochin differ honestly before player and bot eyes.
 */
function makeOhrKeli(energy, plane = 0) {
	return {
		energy,
		plane,
		boosting: false,
		speedState: "cruise"
	};
}

function resolve(plane, energy, requestedBoost, sheltered) {
	const keli = makeOhrKeli(energy, plane);
	const result = new EnergySystem().resolve(keli, requestedBoost, sheltered);
	return { keli, result };
}

test("Asiyah spends 20 Ohr and restores shelter fastest", () => {
	const affinity = OlamAffinity.forPlane(0);
	const boost = resolve(0, ENERGY_CONFIG.max, true, true);
	const recharge = resolve(0, 0, false, true);
	assert.equal(boost.result.boostCost, 20);
	assert.equal(boost.keli.energy, 80);
	assert.equal(recharge.keli.energy, 10);
	assert.equal(affinity.id, "keli");
});

test("Yetzirah sustains exposed Ohr most strongly", () => {
	const sheltered = resolve(1, 0, false, true);
	const exposed = resolve(1, 0, false, false);
	assert.equal(sheltered.keli.energy, 7);
	assert.equal(exposed.keli.energy, 5);
	assert.equal(exposed.result.affinityId, "ruach");
});

test("Beriah makes decisive boost least costly", () => {
	const boost = resolve(2, ENERGY_CONFIG.max, true, false);
	assert.equal(boost.result.boostCost, 14);
	assert.equal(boost.keli.energy, 86);
	assert.equal(boost.result.affinityId, "mochin");
});

test("insufficient current-plane reserve refuses boost and recharges", () => {
	const attempt = resolve(0, 19, true, true);
	assert.equal(attempt.result.boosted, false);
	assert.equal(attempt.keli.energy, 29);
	assert.equal(attempt.keli.speedState, "cruise");
});

test("Ohr never exceeds the shared maximum", () => {
	for (const affinity of OlamAffinity.all()) {
		const attempt = resolve(affinity.plane, 99, false, true);
		assert.equal(attempt.keli.energy, ENERGY_CONFIG.max);
	}
});
