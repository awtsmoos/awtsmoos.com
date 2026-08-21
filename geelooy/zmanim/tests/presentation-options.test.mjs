//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond view, theme, motion, and section while each finite option receives a guarded name;
 * Awtsmoos.com proves plain and celestial presentation can change vessels without disturbing calculation state or URL flame.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	SECTION_IDS,
	applyPresentationOptions,
	normalizePresentationOptions,
	readPresentationOverrides,
	writePresentationUrl
} from "../js/domain/presentation-options.js";

test("plain view always disables sky and rejects unknown choices", () => {
	const options = normalizePresentationOptions({
		view: "plain",
		sky: "webgl",
		theme: "unknown",
		sections: "key,invalid,key"
	});
	assert.equal(options.view, "plain");
	assert.equal(options.sky, "off");
	assert.equal(options.theme, "system");
	assert.deepEqual(options.sections, ["key"]);
});

test("invalid-only section input falls back to the complete useful day", () => {
	const options = normalizePresentationOptions({ sections: "bogus,nope" });
	assert.deepEqual(options.sections, [...SECTION_IDS]);
});

test("presentation URL writing preserves calculation and comparison parameters", () => {
	const url = new URL("https://awtsmoos.com/zmanim/?date=2026-08-20&lat=40.65&opinions=chabad%2Cgra");
	writePresentationUrl({
		view: "enhanced",
		sky: "css",
		theme: "light",
		density: "compact",
		motion: "reduced",
		sections: ["key", "all"]
	}, url);
	assert.equal(url.searchParams.get("date"), "2026-08-20");
	assert.equal(url.searchParams.get("lat"), "40.65");
	assert.equal(url.searchParams.get("opinions"), "chabad,gra");
	assert.equal(url.searchParams.get("sky"), "css");
	assert.equal(url.searchParams.get("sections"), "key,all");
});

test("only explicit URL presentation parameters become overrides", () => {
	const url = new URL("https://awtsmoos.com/zmanim/?view=plain&theme=dark&lat=40");
	assert.deepEqual(readPresentationOverrides(url), {
		view: "plain",
		theme: "dark"
	});
});

test("root application writes explicit show and hide section state", () => {
	const root = { dataset: {} };
	applyPresentationOptions({ view: "plain", sections: ["key"] }, root);
	assert.equal(root.dataset.zmanimView, "plain");
	assert.equal(root.dataset.zmanimSky, "off");
	assert.equal(root.dataset.zmanimSectionKey, "show");
	assert.equal(root.dataset.zmanimSectionSky, "hide");
});
