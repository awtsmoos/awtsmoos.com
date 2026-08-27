//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is One before many shitos describe the gates of one created day;
 * Awtsmoos.com proves the server preserves selection order, primary meaning, shared solar truth, and explicit error boundaries along the way.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateComparison } = require("../lib/comparisonService.js");
const { loadCore } = require("../lib/domainLoader.js");
const { renderEmbed } = require("../lib/embedService.js");

const BROOKLYN = Object.freeze({
	lat: "40.6501",
	lng: "-73.9496",
	date: "2026-08-20",
	timezone: "America/New_York",
	label: "Brooklyn"
});

/** Find one serialized zman inside one comparison calculation. */
function zman(calculation, id) {
	return calculation.zmanim.find(item => item.id === id);
}

test("comparison preserves selected opinion order", async () => {
	const result = await calculateComparison({
		...BROOKLYN,
		opinion: "gra",
		opinions: "gra,chabad,magenAvraham72"
	});
	assert.deepEqual(result.selectedOpinionIds, ["gra", "chabad", "magenAvraham72"]);
	assert.equal(result.primaryOpinion.id, "gra");
	assert.deepEqual(result.calculations.map(item => item.opinion.id), result.selectedOpinionIds);
	assert.equal(result.calculations.every(item => item.zmanim.length === 18), true);
	assert.notEqual(
		zman(result.calculations[0], "sofShema").instant,
		zman(result.calculations[2], "sofShema").instant
	);
});

test("comparison without selected set keeps validated primary", async () => {
	const result = await calculateComparison({
		...BROOKLYN,
		opinion: "gra"
	});
	assert.deepEqual(result.selectedOpinionIds, ["gra"]);
	assert.equal(result.primaryOpinion.id, "gra");
	assert.equal(result.calculations.length, 1);
});

test("primary falls back to first selected like browser", async () => {
	const result = await calculateComparison({
		...BROOKLYN,
		opinion: "chabad",
		opinions: "gra,magenAvraham72"
	});
	assert.equal(result.primaryOpinion.id, "gra");
	assert.deepEqual(result.selectedOpinionIds, ["gra", "magenAvraham72"]);
});

test("opinions=all exposes every canonical shared opinion", async () => {
	const core = await loadCore();
	const expected = core.selection.allSupportedOpinionIds();
	const result = await calculateComparison({
		...BROOKLYN,
		opinions: "all"
	});
	assert.deepEqual(result.selectedOpinionIds, expected);
	assert.equal(result.calculations.length, expected.length);
});

test("unknown selected opinions are rejected", async () => {
	await assert.rejects(
		() => calculateComparison({
			...BROOKLYN,
			opinions: "gra,notARealShita"
		}),
		error => error?.status === 400 && error?.code === "INVALID_OPINIONS"
	);
});

test("static embed renders selected opinions as comparison table", async () => {
	const html = await renderEmbed({
		...BROOKLYN,
		opinion: "chabad",
		opinions: "chabad,gra,magenAvraham72",
		view: "plain",
		sections: "key"
	});
	assert.match(html, /Opinion comparison/);
	assert.match(html, /<table>/);
	assert.match(html, /Chabad/);
	assert.match(html, /Magen Avraham/i);
});
