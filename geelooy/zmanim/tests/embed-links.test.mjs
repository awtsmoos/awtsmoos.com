//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond iframe and query while one measured day may travel through interactive, server, or JSON gates;
 * Awtsmoos.com proves every generated link preserves calculation truth and bounds presentation choices before another page participates.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildEmbedCode, buildEmbedUrl } from "../js/domain/embed-mode.js";
import { resolveEmbedOptions } from "../js/domain/embed-options.js";
import {
	buildDayApiUrl,
	buildServerEmbedUrl
} from "../js/domain/server-embed-url.js";

const SOURCE = new URL(
	"https://awtsmoos.com/zmanim/?date=2026-08-20&lat=40.6501&lng=-73.9496&tz=America%2FNew_York&label=Brooklyn&opinion=chabad&opinions=chabad%2Cgra"
);

test("compact interactive embed preserves calculation and comparison state", () => {
	const url = buildEmbedUrl("compact", SOURCE);
	assert.equal(url.searchParams.get("embed"), "compact");
	assert.equal(url.searchParams.get("view"), "plain");
	assert.equal(url.searchParams.get("sky"), "off");
	assert.equal(url.searchParams.get("sections"), "next,key");
	assert.equal(url.searchParams.get("opinions"), "chabad,gra");
	assert.equal(url.searchParams.get("date"), "2026-08-20");
});

test("server embed maps browser tz into API timezone and applies custom sections", () => {
	const url = buildServerEmbedUrl("custom", SOURCE, {
		view: "enhanced",
		sky: "css",
		sections: ["key", "all"]
	});
	assert.equal(url.pathname, "/api/zmanim/embed");
	assert.equal(url.searchParams.get("timezone"), "America/New_York");
	assert.equal(url.searchParams.has("tz"), false);
	assert.equal(url.searchParams.get("sky"), "css");
	assert.equal(url.searchParams.get("sections"), "key,all");
	assert.equal(url.searchParams.get("opinion"), "chabad");
});

test("JSON day API URL remains renderer-neutral", () => {
	const url = buildDayApiUrl(SOURCE);
	assert.equal(url.pathname, "/api/zmanim/day");
	assert.equal(url.searchParams.get("timezone"), "America/New_York");
	assert.equal(url.searchParams.has("view"), false);
	assert.equal(url.searchParams.has("sky"), false);
});

test("custom embed bounds height and plain mode coerces sky off", () => {
	const options = resolveEmbedOptions("custom", {
		view: "plain",
		sky: "webgl",
		sections: ["all"],
		height: 9000
	});
	assert.equal(options.sky, "off");
	assert.equal(options.height, 1400);
	assert.deepEqual(options.sections, ["all"]);
});

test("iframe code escapes URL ampersands and uses the resolved height", () => {
	const code = buildEmbedCode("compact", SOURCE);
	assert.match(code, /min-height:400px/);
	assert.match(code, /&amp;/);
	assert.doesNotMatch(code, /<script/i);
});
