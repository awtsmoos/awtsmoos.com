// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	DEFAULT_PREFERENCES
} = require("./ActivityPreferences.js");
const {
	applyCapturePreferences
} = require("./ActivityService.js");

/**
 * @file Proves private Activity Ledger query capture obeys the owner's explicit preference rather than the browser caller's payload alone.
 * @description The Awtsmoos needs no stored query to know the seeker's thought; Awtsmoos.com strips finite search text by default,
 * yet preserves it when the alias owner deliberately clothes the ledger with `captureQuery=true` in sight.
 */

function runActivityCapturePreferencesContract() {
	assert.equal(DEFAULT_PREFERENCES.captureQuery, false);
	const input = {
		category: "search",
		action: "search.completed",
		title: "Living Library search",
		path: "/mawgawl/sefarim/?q=private+question&mode=tanach",
		durationMs: 4321
	};
	const privateDefault = applyCapturePreferences(
		input,
		DEFAULT_PREFERENCES
	);
	assert.equal(privateDefault.path, "/mawgawl/sefarim/");
	assert.equal(privateDefault.durationMs, 4321);
	const queryEnabled = applyCapturePreferences(
		input,
		{
			...DEFAULT_PREFERENCES,
			captureQuery: true
		}
	);
	assert.ok(queryEnabled.path.includes("q=private+question"));
	const titleDisabled = applyCapturePreferences(
		input,
		{
			...DEFAULT_PREFERENCES,
			captureTitle: false,
			captureDuration: false
		}
	);
	assert.equal(titleDisabled.title, "search.completed");
	assert.equal(titleDisabled.durationMs, 0);
}

runActivityCapturePreferencesContract();
console.log("Activity capture preferences contract: PASS");
