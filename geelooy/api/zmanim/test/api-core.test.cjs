//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives browser and API one calculation root before any contract can claim success;
 * Awtsmoos.com proves daily, range, metadata, and alias vessels carry the same measured holiness without freezing yesterday's opinion dress.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateDay } = require("../lib/dayService.js");
const { loadCore } = require("../lib/domainLoader.js");
const { calculateRange } = require("../lib/rangeService.js");
const {
	healthPayload,
	methodologyPayload,
	opinionsPayload
} = require("../lib/metadataService.js");

const BROOKLYN = Object.freeze({
	lat: "40.6501",
	lng: "-73.9496",
	date: "2026-08-13",
	timezone: "America/New_York",
	opinion: "chabad",
	label: "Brooklyn"
});

/** Find one serialized zman by stable public id. */
function findZman(result, zmanId) {
	return result.zmanim.find(item => {
		return item.id === zmanId;
	});
}

test("daily API service serializes all shared zmanim", async () => {
	const result = await calculateDay(BROOKLYN);
	assert.equal(result.ok, true);
	assert.equal(result.apiVersion, "1.0.0");
	assert.equal(result.opinion.id, "chabad");
	assert.equal(result.location.timezone, "America/New_York");
	assert.equal(result.zmanim.length, 18);
	assert.ok(result.shaahZmanis.minutes > 60);
	assert.match(result.anchors.sunrise, /^2026-08-13T/);
	const sunrise = findZman(result, "sunrise");
	assert.equal(sunrise.available, true);
	assert.match(sunrise.display, /AM/);
});

test("range API service calculates bounded consecutive dates", async () => {
	const result = await calculateRange({
		...BROOKLYN,
		start: "2026-08-13",
		days: "3",
		opinion: "gra"
	});
	assert.equal(result.count, 3);
	assert.equal(result.days[0].date, "2026-08-13");
	assert.equal(result.days[2].date, "2026-08-15");
	assert.equal(result.days[1].opinion.id, "gra");
});

test("metadata mirrors the complete shared opinion universe", async () => {
	const core = await loadCore();
	const canonicalIds = Object.keys(core.opinions.ZMANIM_OPINIONS);
	const health = await healthPayload();
	const opinions = await opinionsPayload();
	const methodology = await methodologyPayload();
	assert.equal(health.status, "healthy");
	assert.deepEqual(health.opinions, canonicalIds);
	assert.equal(opinions.defaultOpinion, core.opinions.DEFAULT_OPINION_ID);
	assert.deepEqual(opinions.opinions.map(item => item.id), canonicalIds);
	assert.equal(methodology.definitions.length, 18);
	assert.equal(methodology.angles.chabadTrueAnchors, -1.583);
});

test("zmanimms compatibility mount reuses canonical route module", () => {
	const canonical = require("../_awtsmoos.derech.js");
	const alias = require("../../zmanimms/_awtsmoos.derech.js");
	assert.equal(alias.dynamicRoutes, canonical.dynamicRoutes);
});
