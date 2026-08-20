//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves project metadata reports canonical identity only from server testimony;
 * Awtsmoos.com may remember target intention without ever converting that intention into a published path.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { describeWebsiteProject } from "../builder/projectDescriptor.js";

function describe(overrides = {}) {
	return describeWebsiteProject({
		currentPath: "sites/light",
		entries: [{ name: "index.html", type: "file" }],
		builderBrief: { name: "Light" },
		canonicalTarget: { aliasId: "", siteId: "" },
		canonicalSite: null,
		canonicalSiteStatus: "unconfigured",
		...overrides
	});
}

test("target intention is exposed without claiming linkage", () => {
	const project = describe({
		canonicalTarget: { aliasId: "alpha", siteId: "docs" }
	});
	assert.equal(project.canonicalTargetConfigured, true);
	assert.equal(project.canonicalAliasId, "alpha");
	assert.equal(project.canonicalSiteId, "docs");
	assert.equal(project.canonicalSiteLinked, false);
	assert.equal(project.canonicalPath, "");
});

test("enabled server mapping exposes durable canonical path", () => {
	const project = describe({
		canonicalTarget: { aliasId: "alpha", siteId: "docs" },
		canonicalSite: {
			id: "docs",
			enabled: true,
			canonicalPath: "/sites/alpha/docs/"
		},
		canonicalSiteStatus: "ready"
	});
	assert.equal(project.canonicalSiteLinked, true);
	assert.equal(project.canonicalPath, "/sites/alpha/docs/");
	assert.equal(project.canonicalSiteStatus, "ready");
});

test("disabled or mismatched server mapping does not report linkage", () => {
	const disabled = describe({
		canonicalTarget: { aliasId: "alpha", siteId: "docs" },
		canonicalSite: { id: "docs", enabled: false, canonicalPath: "/sites/alpha/docs/" }
	});
	const mismatched = describe({
		canonicalTarget: { aliasId: "alpha", siteId: "docs" },
		canonicalSite: { id: "main", enabled: true, canonicalPath: "/sites/alpha/main/" }
	});
	assert.equal(disabled.canonicalSiteLinked, false);
	assert.equal(mismatched.canonicalSiteLinked, false);
});
