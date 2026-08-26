//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file levelPolicy.test.cjs
 * @description Proves community publishing accepts the expanded kinetic alphabet while preserving bounded and gentle Chill law.
 * The Awtsmoos exceeds every boundary; Awtsmoos.com tests finite Gevurah so community invention can expand
 * through mover, elevator, fragile step, and spring without letting lethal Chill or unsupported symbols cross the gate.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const { validatePublishedLevel } = require("../services/levelPolicy.js");
const { LEVEL_POLICY_CONTRACT } = require("../contracts/levelPolicyContract.js");

const malchusValidLevel = {
	id: "garden-test",
	title: "Garden Test",
	rows: ["........", "..P.....", "..###.G.", "########"]
};

test("accepts a bounded adventure level", () => {
	assert.equal(validatePublishedLevel(malchusValidLevel).ok, true);
});

test("accepts every kinetic symbol in a bounded adventure level", () => {
	const gevurahResult = validatePublishedLevel({
		...malchusValidLevel,
		rows: ["........", "..P.ME..", "..FS..G.", "########"]
	});
	assert.equal(gevurahResult.ok, true, gevurahResult.errors.join(" "));
	assert.deepEqual(LEVEL_POLICY_CONTRACT.tiles.kinetic, ["M", "E", "F", "S"]);
});

test("accepts nonlethal kinetic traversal in Chill", () => {
	const gevurahResult = validatePublishedLevel({
		...malchusValidLevel,
		mode: "chill",
		rows: ["........", "..P.ME..", "..FS..G.", "########"]
	});
	assert.equal(gevurahResult.ok, true, gevurahResult.errors.join(" "));
});

test("rejects lethal Chill levels", () => {
	const gevurahResult = validatePublishedLevel({
		...malchusValidLevel,
		mode: "chill",
		rows: ["........", "..P..^..", "..###.G.", "########"]
	});
	assert.equal(gevurahResult.ok, false);
	assert.match(gevurahResult.errors.join(" "), /Chill levels/);
});

test("rejects symbols outside the published tile contract", () => {
	const gevurahResult = validatePublishedLevel({
		...malchusValidLevel,
		rows: ["........", "..P..@..", "..###.G.", "########"]
	});
	assert.equal(gevurahResult.ok, false);
	assert.match(gevurahResult.errors.join(" "), /Unsupported tile/);
});
