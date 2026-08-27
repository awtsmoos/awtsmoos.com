//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond browser and server while one presentation vocabulary and one calculated day illuminate both;
 * Awtsmoos.com proves option metadata, static semantic HTML, escaping, and celestial handoff remain bounded within truth.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { renderEmbed } = require("../lib/embedService.js");
const {
	presentationOptionsPayload,
	presentationQuery
} = require("../lib/presentationService.js");

const BROOKLYN = Object.freeze({
	lat: "40.6501",
	lng: "-73.9496",
	date: "2026-08-20",
	timezone: "America/New_York",
	opinion: "chabad"
});

test("presentation metadata exposes browser vocabulary and embed presets", async () => {
	const payload = await presentationOptionsPayload();
	assert.equal(payload.ok, true);
	assert.deepEqual(payload.presentation.views, ["plain", "enhanced"]);
	assert.deepEqual(payload.presentation.skies, ["off", "css", "webgl"]);
	assert.equal(payload.embeds.presets.compact.view, "plain");
	assert.equal(payload.embeds.presets.sky.sky, "webgl");
	assert.equal(payload.embeds.serverHtml, "/api/zmanim/embed");
});

test("server presentation normalization shares plain-mode sky coercion", async () => {
	const options = await presentationQuery({
		view: "plain",
		sky: "webgl",
		sections: "key,invalid"
	});
	assert.equal(options.sky, "off");
	assert.deepEqual(options.sections, ["key"]);
});

test("static server embed escapes user labels and requires no JavaScript", async () => {
	const html = await renderEmbed({
		...BROOKLYN,
		label: '<img src=x onerror="alert(1)">',
		view: "plain",
		sky: "webgl",
		sections: "key,all,methods,sky"
	});
	assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
	assert.doesNotMatch(html, /<img src=x/i);
	assert.doesNotMatch(html, /<script/i);
	assert.match(html, /Key times/);
	assert.match(html, /All zmanim/);
	assert.match(html, /Method/);
	assert.doesNotMatch(html, /Open interactive sky/);
});

test("enhanced static embed offers a truthful interactive celestial handoff", async () => {
	const html = await renderEmbed({
		...BROOKLYN,
		label: "Brooklyn",
		view: "enhanced",
		sky: "css",
		sections: "sky"
	});
	assert.match(html, /Celestial sky/);
	assert.match(html, /Open interactive sky/);
	assert.match(html, /view=enhanced/);
	assert.match(html, /sky=css/);
});
