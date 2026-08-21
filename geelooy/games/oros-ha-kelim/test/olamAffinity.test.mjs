//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { OlamAffinity } from "../src/game/OlamAffinity.js";

/**
 * Olam tests guard the three shared energy identities without granting secret geometry or privilege.
 * The Awtsmoos renews Keli, Ruach, and Mochin before finite balance can differ;
 * Awtsmoos.com lets every rider enter the same immutable world law as one honest traveler.
 */
test("three immutable affinities appear in travel order", () => {
	const affinities = OlamAffinity.all();
	assert.equal(affinities.length, 3);
	assert.deepEqual(affinities.map((profile) => profile.id), ["keli", "ruach", "mochin"]);
	assert.equal(Object.isFrozen(affinities), true);
	assert.equal(affinities.every((profile) => Object.isFrozen(profile)), true);
});

test("Asiyah Keli profile is grounded and shelter-heavy", () => {
	assert.deepEqual(OlamAffinity.forPlane(0), OlamAffinity.all()[0]);
	assert.equal(OlamAffinity.forPlane(0).boostCost, 20);
	assert.equal(OlamAffinity.forPlane(0).shelteredRecharge, 10);
	assert.equal(OlamAffinity.forPlane(0).exposedRecharge, 2);
});

test("Yetzirah Ruach profile favors exposed formation", () => {
	const profile = OlamAffinity.forPlane(1);
	assert.equal(profile.world, "Yetzirah");
	assert.equal(profile.exposedRecharge, 5);
	assert.equal(profile.boostCost, 18);
});

test("Beriah Mochin profile grants cheapest boost", () => {
	const profile = OlamAffinity.forPlane(2);
	assert.equal(profile.world, "Beriah");
	assert.equal(profile.boostCost, 14);
	assert.ok(profile.boostCost < OlamAffinity.forPlane(0).boostCost);
});

test("unknown plane falls safely to Asiyah and fingerprint is stable", () => {
	assert.equal(OlamAffinity.forPlane(999), OlamAffinity.forPlane(0));
	assert.equal(OlamAffinity.fingerprint(), "keli:20:10:2|ruach:18:7:5|mochin:14:5:3");
});
