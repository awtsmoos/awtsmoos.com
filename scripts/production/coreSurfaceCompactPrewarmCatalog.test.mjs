//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file coreSurfaceCompactPrewarmCatalog.test.mjs
 * @description
 * The Awtsmoos proves Home, Ikar, and Reader compilation is release work rather
 * than surprise work charged to the first public visitor after restart.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { COMPACT_PREWARM_ROUTES } from "./compact-prewarm-catalog.mjs";

function route(name) {
	return COMPACT_PREWARM_ROUTES.find(entry => entry.name === name);
}

function assertCompactAssets(entry) {
	assert.ok(entry, "critical route missing");
	assert.ok(entry.assets.length > 0, `${entry.name} has no explicit compact assets`);
	for (const asset of entry.assets) {
		const url = new URL(asset, "https://awtsmoos.com");
		assert.equal(url.origin, "https://awtsmoos.com");
		assert.equal(url.searchParams.get("compact"), "true");
	}
}
test("Home prewarms its generated application graph", () => {
	const home = route("Awtsmoos Home");
	assert.equal(home?.path, "/");
	assertCompactAssets(home);
	assert.match(home.assets[0], /\/scripts\/home-simple\/index\.js/);
});

test("Ikar prewarms core plus deferred interaction garments", () => {
	const ikar = route("Ikar Torah Library");
	assert.equal(ikar?.path, "/heichelos/ikar");
	assertCompactAssets(ikar);
	for (const token of ["/heichel/app.js", "/shell/boot.js", "SocialExperienceInstaller.js", "appNavigation.js", "/cosmic/boot.js"]) {
		assert.ok(ikar.assets.some(asset => asset.includes(token)), `Ikar prewarm lost ${token}`);
	}
});

test("Reader prewarms a real Torah route and reader runtime", () => {
	const reader = route("Torah Reader");
	assert.match(reader?.path || "", /^\/heichelos\/ikar\/series\/bereishis\/post\//);
	assertCompactAssets(reader);
	assert.ok(reader.assets.some(asset => asset.includes("/heichelos/post/postLogic.js")));
});

test("core prewarm declarations stay unique and immutable", () => {
	for (const name of ["Awtsmoos Home", "Ikar Torah Library", "Torah Reader"]) {
		assert.equal(COMPACT_PREWARM_ROUTES.filter(entry => entry.name === name).length, 1);
		assert.equal(Object.isFrozen(route(name)), true);
		assert.equal(Object.isFrozen(route(name).assets), true);
	}
});
