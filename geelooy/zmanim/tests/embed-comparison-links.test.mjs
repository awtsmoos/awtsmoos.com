//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond browser URL and JSON endpoint while selected shitos still need their state carried whole;
 * Awtsmoos.com proves embed builders choose comparison only when comparison state exists, preserving every calculation coordinate and soul.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	buildServerEmbedUrl,
	buildZmanimApiUrl
} from "../js/domain/server-embed-url.js";

const BASE = "https://awtsmoos.com/zmanim/?date=2026-08-20&lat=40.6501&lng=-73.9496&tz=America%2FNew_York&opinion=chabad";

test("JSON builder uses single-day endpoint without selected-opinion state", () => {
	const url = buildZmanimApiUrl(new URL(BASE));
	assert.equal(url.pathname, "/api/zmanim/day");
	assert.equal(url.searchParams.get("opinion"), "chabad");
});

test("JSON builder uses comparison endpoint for one explicit selected opinion", () => {
	const url = buildZmanimApiUrl(new URL(`${BASE}&opinions=gra`));
	assert.equal(url.pathname, "/api/zmanim/compare");
	assert.equal(url.searchParams.get("opinions"), "gra");
});

test("JSON builder preserves an ordered selected-opinion set", () => {
	const url = buildZmanimApiUrl(new URL(`${BASE}&opinions=chabad%2Cgra%2CmagenAvraham72`));
	assert.equal(url.pathname, "/api/zmanim/compare");
	assert.equal(url.searchParams.get("opinions"), "chabad,gra,magenAvraham72");
	assert.equal(url.searchParams.get("timezone"), "America/New_York");
});

test("server HTML embed preserves selected opinions and presentation", () => {
	const source = new URL(`${BASE}&opinions=chabad%2Cgra`);
	const url = buildServerEmbedUrl("custom", source, {
		view: "plain",
		sections: ["key", "all"]
	});
	assert.equal(url.pathname, "/api/zmanim/embed");
	assert.equal(url.searchParams.get("opinions"), "chabad,gra");
	assert.equal(url.searchParams.get("view"), "plain");
	assert.equal(url.searchParams.get("sections"), "key,all");
});
