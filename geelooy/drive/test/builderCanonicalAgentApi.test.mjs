//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical machine-action behavior tests over the shared human publication service boundary.
 * @description
 * The Awtsmoos lets an agent request identity without granting it a filesystem road;
 * Awtsmoos.com proves durable apply and detach pass through one canonical service while temporary preview remains another covenant entirely.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { GeelooyWebsiteBuilderApi } from "../builder/agentApi.js";
import { MalchusDriveState } from "../core/state.js";

function harness({ withService = true, failApply = false } = {}) {
	const calls = [];
	const state = new MalchusDriveState({
		currentPath: "sites/light",
		transportCanPublish: true
	});
	const canonicalSite = withService ? {
		setTarget(target) {
			calls.push(["target", target]);
			state.patch({ canonicalTarget: target, canonicalSite: null, canonicalSiteStatus: "unconfigured" });
			return target;
		},
		async apply(...args) {
			calls.push(["apply", args]);
			if (failApply) {
				state.patch({ error: "Write scope required." });
				return false;
			}
			const site = { id: "home", rootPath: "sites/light", enabled: true, canonicalPath: "/sites/alpha/home/" };
			state.patch({ canonicalSite: site, canonicalSiteStatus: "ready" });
			return site;
		},
		async detach(...args) {
			calls.push(["detach", args]);
			state.patch({ canonicalSite: null, canonicalSiteStatus: "unconfigured" });
			return { deleted: true };
		}
	} : null;
	const workspace = {
		async publishCurrentFolder() {
			calls.push(["preview"]);
			return { previewId: "temporary" };
		}
	};
	const panels = { isMobile: () => false, open: () => true };
	return {
		api: new GeelooyWebsiteBuilderApi({ state, workspace, panels, canonicalSite }),
		state,
		calls
	};
}

test("target action configures only alias and site and remains unlinked", async () => {
	const subject = harness();
	const result = await subject.api.run("site.publish.canonicalTarget", {
		aliasId: "alpha",
		siteId: "home",
		rootPath: "../../other-user"
	});
	assert.equal(result.ok, true);
	assert.deepEqual(subject.calls[0], ["target", { aliasId: "alpha", siteId: "home" }]);
	assert.equal(result.data.canonicalPublication.linked, false);
});

test("status is read-only even when canonical service is absent", async () => {
	const subject = harness({ withService: false });
	const result = await subject.api.run("site.publish.canonicalStatus");
	assert.equal(result.ok, true);
	assert.equal(result.mutates, false);
	assert.equal(result.data.linked, false);
	assert.deepEqual(subject.calls, []);
});

test("apply ignores arbitrary input root and delegates without arguments", async () => {
	const subject = harness();
	await subject.api.run("site.publish.canonicalTarget", { aliasId: "alpha", siteId: "home" });
	const result = await subject.api.run("site.publish.canonicalApply", { rootPath: "evil/root" });
	assert.equal(result.ok, true);
	assert.deepEqual(subject.calls.at(-1), ["apply", []]);
	assert.equal(result.data.canonicalPublication.linked, true);
	assert.equal(result.requiredScope, "write");
});

test("detach delegates once and does not invoke preview publication", async () => {
	const subject = harness();
	const result = await subject.api.run("site.publish.canonicalDetach");
	assert.equal(result.ok, true);
	assert.deepEqual(subject.calls, [["detach", []]]);
});

test("missing service and failed server mutation fail closed", async () => {
	const missing = await harness({ withService: false }).api.run("site.publish.canonicalApply");
	assert.equal(missing.ok, false);
	assert.equal(missing.error, "CANONICAL_SITE_SERVICE_UNAVAILABLE");
	const denied = await harness({ failApply: true }).api.run("site.publish.canonicalApply");
	assert.equal(denied.ok, false);
	assert.equal(denied.error, "CANONICAL_SITE_PUBLICATION_FAILED");
	assert.equal(denied.message, "Write scope required.");
});

test("legacy publish apply remains temporary preview and bypasses canonical service", async () => {
	const subject = harness();
	const result = await subject.api.run("site.publish.apply");
	assert.equal(result.ok, true);
	assert.deepEqual(subject.calls, [["preview"]]);
	assert.equal(result.affected, "preview-publication");
});
