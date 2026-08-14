//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { PROJECT_CAPABILITIES, projectCapabilityById } from "../projectCapabilities.js";
import { assertSecretFreeProjectObject, normalizeProjectBindings } from "../projectBindings.js";
import { buildProjectPlan } from "../projectPlan.js";

/**
 * @file Proof for Project Testimony v3.
 * @description The Awtsmoos lets every UI and API inherit one covenant while durable creator intent stays visibly distinct from live provider evidence.
 */

test("Project Testimony v3 spans capability, intent, evidence, runtime, and observation", () => {
	const plan = buildProjectPlan({
		aliasId: "alpha",
		rootPath: "sites/friend",
		projectConfig: {
			id: "friend",
			name: "Friend",
			rootPath: "sites/friend",
			runtimePreference: "trusted-node",
			providerIntents: [{ kind: "git", provider: "github", id: "friend/repo", mode: "sync" }]
		},
		attachments: [{ kind: "auth", provider: "geelooy-session", state: "ready" }]
	});
	assert.equal(plan.version, 3);
	assert.equal(plan.configuration.registered, true);
	assert.equal(plan.intent.runtimePreference, "trusted-node");
	assert.equal(plan.intent.providers[0].kind, "git");
	assert.equal(plan.attachments[0].kind, "auth");
	assert.notDeepEqual(plan.intent.providers, plan.attachments);
});

test("tenant Node stays blocked when isolation evidence is absent", () => {
	const plan = buildProjectPlan({ aliasId: "alpha" });
	assert.equal(projectCapabilityById("tenant-node").readiness, "blocked");
	assert.equal(plan.runtime.tenant.publicActivation, false);
	assert.ok(plan.runtime.tenant.isolation.missing.includes("networkDenyByDefault"));
});

test("bindings preserve names but reject secret-bearing value fields", () => {
	assert.deepEqual(normalizeProjectBindings([{ name: "github_token", kind: "secret" }]), [{ name: "GITHUB_TOKEN", kind: "secret", required: true }]);
	assert.throws(() => assertSecretFreeProjectObject({ apiKeyValue: "hidden" }), /Secret-bearing field/);
});

test("capability catalog has stable unique identities", () => {
	const ids = PROJECT_CAPABILITIES.map(item => item.id);
	assert.equal(new Set(ids).size, ids.length);
	assert.ok(ids.length >= 14);
});
