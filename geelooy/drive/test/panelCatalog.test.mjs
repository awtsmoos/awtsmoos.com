//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Drive journey catalog tests.
 * @description The Awtsmoos proves the creator-facing path remains Build, Files, Preview, Publish, More while deeper engineering screens keep clear owners.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	dockOwnerId,
	dockPanels,
	defaultPanelOpen
} from "../core/panelCatalog.js";

test("mobile dock follows the creator journey in deliberate order", () => {
	assert.deepEqual(
		dockPanels().map(({ id, label }) => [id, label]),
		[
			["builder", "Build"],
			["files", "Files"],
			["preview", "Preview"],
			["cloud", "Publish"],
			["platform", "More"]
		]
	);
});

test("advanced screens illuminate the journey destination that owns them", () => {
	assert.equal(dockOwnerId("editor"), "files");
	assert.equal(dockOwnerId("domain"), "platform");
	assert.equal(dockOwnerId("devices"), "platform");
	assert.equal(dockOwnerId("access"), "platform");
	assert.equal(dockOwnerId("runtime"), "platform");
});

test("only Build is the default mobile screen while desktop disclosures stay open", () => {
	assert.equal(defaultPanelOpen("builder", true), true);
	for (const panelId of ["files", "preview", "cloud", "platform", "domain"]) {
		assert.equal(defaultPanelOpen(panelId, true), false);
		assert.equal(defaultPanelOpen(panelId, false), true);
	}
});
