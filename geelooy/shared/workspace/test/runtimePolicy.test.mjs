//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { normalizeProjectAttachments } from "../projectAttachments.js";
import { PROJECT_OBSERVABILITY, observabilityMetric } from "../projectObservability.js";
import { evaluateRuntimeIsolation, requiredIsolationEvidence } from "../runtimeIsolation.js";
import { runtimeQuotaProfile } from "../runtimeQuotaPolicy.js";

/**
 * @file Proof for policy, isolation evidence, telemetry vocabulary, and credential-free attachments.
 * @description The Awtsmoos lets stronger runtime power emerge only when every required boundary gives matching testimony.
 */

test("tenant activation requires a real provider boundary and every evidence flag", () => {
	const flags = Object.fromEntries(requiredIsolationEvidence().map(key => [key, true]));
	assert.equal(evaluateRuntimeIsolation({ providerKind: "process", ...flags }).publicTenantActivation, false);
	assert.equal(evaluateRuntimeIsolation({ providerKind: "container", ...flags }).publicTenantActivation, true);
	assert.equal(evaluateRuntimeIsolation({ providerKind: "vm", ...flags, networkDenyByDefault: false }).publicTenantActivation, false);
});

test("quota profiles remain policy declarations until a provider proves enforcement", () => {
	assert.equal(runtimeQuotaProfile("tenant").enforcement, "policy-only-until-provider-proves");
	assert.ok(runtimeQuotaProfile("tenant").limits.memoryBytes < runtimeQuotaProfile("trusted").limits.memoryBytes);
});

test("observability ids are unique and include resource plus billing testimony", () => {
	const ids = PROJECT_OBSERVABILITY.map(item => item.id);
	assert.equal(new Set(ids).size, ids.length);
	assert.equal(observabilityMetric("memoryBytes").unit, "bytes");
	assert.equal(observabilityMetric("perutaUsage").unit, "peruta");
});

test("attachments preserve provider state but reject credential-shaped fields", () => {
	assert.deepEqual(normalizeProjectAttachments([{ kind: "git", provider: "github", state: "ready", id: "repo-1" }]), [
		{ kind: "git", provider: "github", state: "ready", id: "repo-1" }
	]);
	assert.throws(() => normalizeProjectAttachments([{ kind: "git", provider: "github", token: "hidden" }]), /Credential fields/);
});
