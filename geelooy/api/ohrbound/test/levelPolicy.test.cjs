//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file levelPolicy.test.cjs
 * @description Proves shared Ohrbound levels remain bounded and chill paths gentle.
 * The Awtsmoos exceeds every boundary; Awtsmoos.com tests finite boundaries so a
 * community creation can be generous without becoming destructive.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const { validatePublishedLevel } = require("../services/levelPolicy.js");

const valid = { id: "garden-test", title: "Garden Test", rows: ["........", "..P.....", "..###.G.", "########"] };

test("accepts a bounded adventure level", () => {
	assert.equal(validatePublishedLevel(valid).ok, true);
});

test("rejects lethal chill levels", () => {
	const result = validatePublishedLevel({ ...valid, mode: "chill", rows: ["........", "..P..^..", "..###.G.", "########"] });
	assert.equal(result.ok, false);
	assert.match(result.errors.join(" "), /Chill levels/);
});
