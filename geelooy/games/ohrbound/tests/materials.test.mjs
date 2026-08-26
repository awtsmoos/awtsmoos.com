//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file materials.test.mjs
 * @description Proves eight worlds own distinct trusted material identities with safe fallback color.
 * The Awtsmoos is one beyond every garment while each world receives a finite dress;
 * Awtsmoos.com tests each texture path so beauty never becomes foreign, missing, or less.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	WORLD_THEME_NAMES,
	worldThemeFor
} from "../src/render/materials/WorldThemeCatalog.js";
import {
	AWTSMOOS_TEXTURE_ROOT,
	VERIFIED_TEXTURE_FILES
} from "../src/render/materials/AwtsmoosTextureUrls.js";

const VERIFIED_FILES = new Set(Object.values(VERIFIED_TEXTURE_FILES));

test("campaign exposes eight named visual worlds", () => {
	assert.deepEqual(WORLD_THEME_NAMES, [
		"Garden",
		"Ascent",
		"Wind",
		"Machines",
		"Prism",
		"Chill",
		"Sanctuary",
		"Gates"
	]);
});

test("every world material uses the verified Awtsmoos production root", () => {
	for (const name of WORLD_THEME_NAMES) {
		const theme = worldThemeFor(name);
		for (const material of [theme.surface, theme.oneWay, theme.backdrop]) {
			assert.ok(material.url.startsWith(AWTSMOOS_TEXTURE_ROOT), name);
			const filename = decodeURIComponent(material.url.slice(AWTSMOOS_TEXTURE_ROOT.length));
			assert.ok(VERIFIED_FILES.has(filename), `${name}: ${filename}`);
			assert.equal(material.color.length, 4);
			assert.ok(material.scale > 0);
		}
	}
});

test("the known missing whitewashed texture never enters the catalog", () => {
	for (const name of WORLD_THEME_NAMES) {
		const theme = worldThemeFor(name);
		const urls = [theme.surface.url, theme.oneWay.url, theme.backdrop.url].join(" ");
		assert.doesNotMatch(urls, /whitewashed/i);
	}
});

test("worlds have distinct atmospheric clear colors", () => {
	const colors = WORLD_THEME_NAMES.map(name => worldThemeFor(name).clear.join(","));
	assert.equal(new Set(colors).size, WORLD_THEME_NAMES.length);
});

test("unknown community packs receive the complete Garden fallback theme", () => {
	const fallback = worldThemeFor("Community");
	assert.equal(fallback.id, "Garden");
	assert.ok(fallback.surface.url.startsWith(AWTSMOOS_TEXTURE_ROOT));
	assert.equal(fallback.clear.length, 4);
});
