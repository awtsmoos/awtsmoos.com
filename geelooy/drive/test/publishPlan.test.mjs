//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves four publication gates remain different even when one workspace carries them all;
 * Awtsmoos.com never lets a configured target, temporary preview, or domain plan impersonate server-confirmed canonical publication.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { buildPublishPlan } from "../builder/publishPlan.js";

function state(overrides = {}) {
	return {
		currentPath: "sites/light",
		entries: [{ name: "index.html", type: "file", size: 12 }],
		previews: [],
		transportCanPublish: true,
		builderBrief: { name: "House of Light" },
		canonicalTarget: { aliasId: "", siteId: "" },
		canonicalSite: null,
		canonicalSiteStatus: "unconfigured",
		domainPlan: null,
		...overrides
	};
}

test("publication plan always exposes four ordered stages", () => {
	const plan = buildPublishPlan(state());
	assert.deepEqual(plan.stages.map(stage => stage.id), [
		"source-preview",
		"owned-folder-preview",
		"canonical-site",
		"custom-domain"
	]);
	assert.equal(plan.sourcePreview.available, true);
	assert.equal(plan.previewPublication.available, true);
});

test("configured canonical target is not linked server proof", () => {
	const plan = buildPublishPlan(state({
		canonicalTarget: { aliasId: "alpha", siteId: "docs" }
	}));
	assert.equal(plan.canonicalPublication.targetConfigured, true);
	assert.equal(plan.canonicalPublication.linked, false);
	assert.equal(plan.canonicalPublication.canonicalPath, "");
	assert.equal(plan.canonicalPublication.status, "Ready for server proof");
	assert.equal(plan.customDomain.canonicalRequired, true);
});

test("only server-returned enabled canonical mapping links stage three", () => {
	const plan = buildPublishPlan(state({
		canonicalTarget: { aliasId: "alpha", siteId: "docs" },
		canonicalSite: {
			id: "docs",
			enabled: true,
			canonicalPath: "/sites/alpha/docs/"
		},
		canonicalSiteStatus: "ready"
	}));
	assert.equal(plan.canonicalPublication.linked, true);
	assert.equal(plan.canonicalPublication.canonicalPath, "/sites/alpha/docs/");
	assert.equal(plan.canonicalPublication.state, "ready");
	assert.equal(plan.customDomain.canonicalRequired, false);
	assert.equal(plan.customDomain.state, "planning");
});

test("owned preview remains temporary and independent of canonical linkage", () => {
	const plan = buildPublishPlan(state({ previews: [{ id: "p1" }] }));
	assert.equal(plan.previewPublication.count, 1);
	assert.equal(plan.previewPublication.kind, "owned-folder-preview");
	assert.equal(plan.previewPublication.defaultVisibility, "private");
	assert.equal(plan.canonicalPublication.linked, false);
});

test("domain plan remains planning-only after canonical publication", () => {
	const plan = buildPublishPlan(state({
		canonicalTarget: { aliasId: "alpha", siteId: "main" },
		canonicalSite: { id: "main", enabled: true, canonicalPath: "/sites/alpha/main/" },
		domainPlan: { hostname: "example.org" }
	}));
	assert.equal(plan.customDomain.planningOnly, true);
	assert.equal(plan.customDomain.available, false);
	assert.equal(plan.customDomain.status, "Plan prepared");
});
