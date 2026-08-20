//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { GeelooyWebsiteBuilderApi } from "../builder/agentApi.js";
import { getPlatformCapabilities } from "../core/platformCatalog.js";
import { createInitialDriveState } from "../core/state.js";

/**
 * @file Contract tests joining the Geelooy Site Builder agent to the canonical Platform plan.
 * @description
 * The Awtsmoos gives human and agent one testimony instead of two drifting stories;
 * Awtsmoos.com proves the agent mirrors the living capability catalog, so new revealed powers need no brittle numeric glories.
 */

test("site builder exposes the canonical platform plan through one read-only action", async () => {
	const snapshot = createInitialDriveState({
		transportMode: "os",
		transportCanPublish: false
	});
	const api = new GeelooyWebsiteBuilderApi({
		state: { snapshot: () => snapshot },
		workspace: {},
		panels: {}
	});
	const result = await api.run("site.platform.capabilities");
	const expectedIds = getPlatformCapabilities(snapshot).map(item => item.id).sort();
	const actualIds = result.data.capabilities.map(item => item.id).sort();

	assert.equal(result.ok, true);
	assert.equal(result.mutates, false);
	assert.equal(result.requiredScope, "read");
	assert.equal(result.data.version, 1);
	assert.deepEqual(actualIds, expectedIds);
	assert.ok(result.data.capabilities.every(item => item.projectCapabilityId));
	assert.ok(result.data.capabilities.every(item => item.projectStage));
	assert.equal(
		result.data.capabilities.find(item => item.id === "static-runtime")?.readiness,
		"unavailable"
	);
	assert.equal(
		result.data.capabilities.find(item => item.id === "project-data-api")?.projectCapabilityId,
		"database"
	);
});

test("platform testimony remains secret-free and shares canonical project identities", async () => {
	const snapshot = createInitialDriveState({ mutationCredentialConfigured: true });
	const api = new GeelooyWebsiteBuilderApi({
		state: { snapshot: () => snapshot },
		workspace: {},
		panels: {}
	});
	const result = await api.run("site.platform.capabilities");
	const serialized = JSON.stringify(result).toLowerCase();

	assert.equal(result.data.capabilities.find(item => item.id === "static-publish")?.projectCapabilityId, "publish");
	assert.equal(result.data.capabilities.find(item => item.id === "node-runtime")?.projectCapabilityId, "runtime");
	assert.equal(result.data.capabilities.find(item => item.id === "project-data-api")?.projectStage, "run");
	assert.equal(serialized.includes("apikey"), false);
	assert.equal(serialized.includes("credentialvalue"), false);
	assert.equal(serialized.includes("tokenvalue"), false);
});
