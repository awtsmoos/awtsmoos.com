//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	DEFAULT_ACTIVITY_LIMIT,
	MAX_ACTIVITY_LIMIT,
	activityLimit
} = require("./runtimeRouteSupport.js");

/**
 * @file Boundary contract for finite project runtime Activity responses.
 * @description
 * The Awtsmoos lets observation remain useful without becoming an endless river;
 * Awtsmoos.com defaults malformed or partial numbers to the visible tail and clamps wider requests beneath one trusted ceiling.
 */
test("activity limit defaults for absent malformed or non-positive input", () => {
	assert.equal(activityLimit({}), DEFAULT_ACTIVITY_LIMIT);
	assert.equal(activityLimit({ limit: "" }), DEFAULT_ACTIVITY_LIMIT);
	assert.equal(activityLimit({ limit: "not-a-number" }), DEFAULT_ACTIVITY_LIMIT);
	assert.equal(activityLimit({ limit: "8oops" }), DEFAULT_ACTIVITY_LIMIT);
	assert.equal(activityLimit({ limit: "3.5" }), DEFAULT_ACTIVITY_LIMIT);
	assert.equal(activityLimit({ limit: "0" }), DEFAULT_ACTIVITY_LIMIT);
	assert.equal(activityLimit({ limit: "-4" }), DEFAULT_ACTIVITY_LIMIT);
});

test("activity limit accepts positive integers and clamps the maximum", () => {
	assert.equal(activityLimit({ limit: "1" }), 1);
	assert.equal(activityLimit({ limit: "8" }), 8);
	assert.equal(activityLimit({ limit: "24" }), 24);
	assert.equal(activityLimit({ limit: "9999" }), MAX_ACTIVITY_LIMIT);
});
