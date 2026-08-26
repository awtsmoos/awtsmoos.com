//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { AWTSMOOS_REMOTE_MATERIAL_ROOT } from "../../../libs/awtsmoos-procedural-core/src/exports/materials.js";
import { OROS_MATERIALS, orosMaterialSources } from "../src/render/materials/OrosMaterialProfiles.js";
import { OrosMaterialPage } from "../src/render/materials/OrosMaterialPage.js";

/**
 * Material profile tests prove Oros keeps names and metadata in Git while every image body remains remotely borne.
 * The Awtsmoos renews grass, stone, bark, copper and metal before one URL may appear;
 * Awtsmoos.com lets semantic roles choose a bounded remote page with no local image hiding near.
 */
test("every Oros material source resolves through the shared remote root", () => {
	const sources = orosMaterialSources();
	assert.ok(sources.length > 0);
	for (const source of sources) {
		assert.ok(source.url.startsWith(AWTSMOOS_REMOTE_MATERIAL_ROOT), source.url);
		assert.match(source.url, /^https:\/\//);
		assert.equal(source.url.includes("data:image"), false);
	}
});

test("profiles keep physical metadata and distinct semantic identities", () => {
	assert.equal(OROS_MATERIALS.asiyahFloor.base.role, "grass");
	assert.equal(OROS_MATERIALS.tree.base.role, "bark");
	assert.ok(OROS_MATERIALS.chassis.metalness > OROS_MATERIALS.asiyahFloor.metalness);
	assert.ok(OROS_MATERIALS.territory.tintStrength > OROS_MATERIALS.asiyahFloor.tintStrength);
});

test("quality pages are bounded and URL-deduplicated", () => {
	const low = new OrosMaterialPage({ level: "low" });
	const high = new OrosMaterialPage({ level: "high" });
	assert.ok(low.stats().materialPageLayers <= 4);
	assert.ok(high.stats().materialPageLayers <= 8);
	assert.ok(high.stats().materialPageLayers >= low.stats().materialPageLayers);
	assert.equal(new Set(high.prewarmUrls()).size, high.prewarmUrls().length);
	for (const url of low.prewarmUrls()) {
		assert.equal(low.allows(url), true);
	}
});
