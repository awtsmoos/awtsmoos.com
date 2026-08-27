//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves browser intention is not ownership: only server-returned mapping testimony becomes canonical truth;
 * Awtsmoos.com binds the active Drive root while failed authority leaves source and preview untouched.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createCanonicalSiteHarness } from "./canonicalSiteTestHarness.mjs";

test("target input alone never becomes canonical proof", () => {
	const subject = createCanonicalSiteHarness({
		canonicalSite: { id: "old" },
		canonicalSiteStatus: "ready"
	});
	const target = subject.service.setTarget({ aliasId: " alpha ", siteId: " docs " });
	assert.deepEqual(target, { aliasId: "alpha", siteId: "docs" });
	const snapshot = subject.state.snapshot();
	assert.equal(snapshot.canonicalSite, null);
	assert.equal(snapshot.canonicalSiteStatus, "unconfigured");
	assert.deepEqual(subject.calls, []);
});

test("refresh selects only the exact server-returned site", async () => {
	const subject = createCanonicalSiteHarness({
		canonicalTarget: { aliasId: "alpha", siteId: "docs" },
		listSites: [
			{ id: "main", enabled: true },
			{ id: "docs", enabled: true, canonicalPath: "/sites/alpha/docs/" }
		]
	});
	const result = await subject.service.refresh();
	assert.equal(result.canonicalSite.id, "docs");
	assert.equal(subject.state.snapshot().canonicalSite.id, "docs");
	assert.equal(subject.state.snapshot().canonicalSiteStatus, "ready");
	assert.deepEqual(subject.calls, [["list", "alpha"]]);
});

test("refresh with no exact server mapping stays unlinked", async () => {
	const subject = createCanonicalSiteHarness({
		canonicalTarget: { aliasId: "alpha", siteId: "docs" },
		listSites: [{ id: "main", enabled: true }]
	});
	await subject.service.refresh();
	assert.equal(subject.state.snapshot().canonicalSite, null);
	assert.equal(subject.state.snapshot().canonicalSiteStatus, "unconfigured");
});

test("apply derives root from active workspace and trusts server response", async () => {
	const subject = createCanonicalSiteHarness({
		canonicalTarget: { aliasId: "alpha", siteId: "docs" }
	});
	const site = await subject.service.apply();
	assert.equal(site.canonicalPath, "/sites/alpha/docs/");
	assert.deepEqual(subject.calls[0], ["upsert", {
		aliasId: "alpha",
		siteId: "docs",
		rootPath: "sites/light",
		enabled: true
	}]);
	assert.equal(subject.state.snapshot().canonicalSite, site);
});

test("root workspace publishes as normalized empty Drive root", async () => {
	const subject = createCanonicalSiteHarness({
		currentPath: ".",
		canonicalTarget: { aliasId: "alpha", siteId: "main" }
	});
	await subject.service.apply();
	assert.equal(subject.calls[0][1].rootPath, "");
});

test("failed apply never invents a new canonical site", async () => {
	const subject = createCanonicalSiteHarness({
		canonicalTarget: { aliasId: "alpha", siteId: "docs" },
		upsertError: new Error("Forbidden")
	});
	assert.equal(await subject.service.apply(), false);
	assert.equal(subject.state.snapshot().canonicalSite, null);
	assert.equal(subject.state.snapshot().canonicalSiteStatus, "error");
});

test("detach removes mapping proof but leaves source and previews untouched", async () => {
	const subject = createCanonicalSiteHarness({
		canonicalTarget: { aliasId: "alpha", siteId: "docs" },
		canonicalSite: { id: "docs", enabled: true },
		canonicalSites: [{ id: "docs", enabled: true }]
	});
	const before = subject.state.snapshot();
	await subject.service.detach();
	const after = subject.state.snapshot();
	assert.deepEqual(after.entries, before.entries);
	assert.deepEqual(after.previews, before.previews);
	assert.deepEqual(after.builderBrief, before.builderBrief);
	assert.equal(after.currentPath, before.currentPath);
	assert.equal(after.canonicalSite, null);
	assert.deepEqual(subject.calls[0], ["delete", { aliasId: "alpha", siteId: "docs" }]);
});
