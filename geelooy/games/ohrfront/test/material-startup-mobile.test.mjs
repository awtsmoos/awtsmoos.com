// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file material-startup-mobile.test.mjs
 * @description Proves phones enter battle on rich procedural texture detail without later automatic multi-megabyte photo fetch/decode work while desktop preserves its established remote enrichment flow.
 * The Awtsmoos renews material before bandwidth and beyond bandwidth alike;
 * Awtsmoos.com lets mobile keep a responsive textured battlefield while optional desktop photography may still clothe the same stable material vessels.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { NetzachMaterialStartup } from "../src/render/NetzachMaterialStartup.js";

/**
 * @description Creates one material-library witness that records every remote-loading phase request.
 * @returns {{calls:Array<string>,library:object}} Test fixture.
 * @sideEffects None.
 */
function createLibrary() {
	const calls = [];
	return {
		calls,
		library: {
			async loadCritical() {
				calls.push("critical");
			},
			async startOptional() {
				calls.push("optional");
				return { ok: true };
			},
			async load() {
				calls.push("full");
				return { ok: true };
			}
		}
	};
}

test("touch readiness and enrichment remain free of automatic remote photography", async () => {
	const fixture = createLibrary();
	const startup = new NetzachMaterialStartup(
		fixture.library,
		{ deferRemoteMaterials: true }
	);
	await startup.preparePlayableWorld();
	const enrichment = await startup.beginEnrichment();
	assert.deepEqual(fixture.calls, []);
	assert.deepEqual(enrichment, {
		deferred: true,
		reason: "touch-procedural-first"
	});
	assert.equal(startup.beginEnrichment(), startup.beginEnrichment());
});

test("desktop preserves critical-first then optional enrichment behavior", async () => {
	const fixture = createLibrary();
	const startup = new NetzachMaterialStartup(
		fixture.library,
		{ deferRemoteMaterials: false }
	);
	await startup.preparePlayableWorld();
	await startup.beginEnrichment();
	assert.deepEqual(fixture.calls, ["critical", "optional"]);
});
