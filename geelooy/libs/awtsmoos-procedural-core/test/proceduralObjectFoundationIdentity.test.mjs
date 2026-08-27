// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos clothes exact content, logical identity, and topology intent separately. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const firstId = api.createStableId("mesh", { name: "radiant" });
assert.equal(firstId, api.createStableId("mesh", { name: "radiant" }));
assert.notEqual(firstId, api.createStableId("mesh", { name: "other" }));
assert.equal(api.isStableId(firstId), true);

const artifact = api.createUniversalArtifact({
	schema: "scene.mesh",
	schemaVersion: "1.0.0",
	revision: 1,
	parentRevision: 0,
	identitySeed: "radiant-mesh",
	payload: { vertices: 3, label: "light" },
	provenance: { operation: "mesh.create" },
	diagnostics: [{
		code: "ARTIFACT.TEST_SIGNAL",
		severity: "info",
		message: "Artifact identity is visible."
	}],
	resourceUsage: { vertices: 3, bytes: 64 }
});
assert.equal(artifact.schema, "scene.mesh");
assert.equal(artifact.diagnostics[0].code, "ARTIFACT.TEST_SIGNAL");
assert.equal(Object.isFrozen(artifact.payload), true);
assert.equal(Object.isFrozen(artifact), true);

const exactReference = api.createArtifactReference({
	artifactId: artifact.id,
	revision: artifact.revision,
	contentHash: artifact.contentHash,
	expectedSchema: artifact.schema,
	path: ["schema"]
});
assert.equal(api.resolveArtifactReference(artifact, exactReference).value, "scene.mesh");
const stale = api.resolveArtifactReference(artifact, {
	...exactReference,
	revision: 0
});
assert.equal(stale.ok, false);
assert.equal(stale.diagnostic.code, "REFERENCE.STALE_REVISION");

const operations = new api.OperationDefinitionRegistry();
operations.register({ name: "mesh.refine", version: "1.0.0" });
operations.register({ name: "mesh.refine", version: "1.1.0-beta.1" });
operations.register({ name: "mesh.refine", version: "1.1.0" });
assert.equal(operations.resolve("mesh.refine").version, "1.1.0");
assert.throws(
	() => operations.register({ name: "mesh.refine", version: "1.1.0" }),
	/already registered/
);
assert.equal(api.compareSemanticVersions("2.0.0", "1.9.9"), 1);

const capabilities = new api.CapabilityManifestRegistry();
capabilities.register({
	id: "core.mesh",
	version: "1.0.0",
	provides: ["mesh.geometry", "mesh.topology"]
});
assert.deepEqual(
	capabilities.missingRequirements(["mesh.geometry", "scene.world"]),
	["scene.world"]
);

const tool = api.createToolManifest({
	id: "tools.meshRefine",
	version: "1.0.0",
	operations: [
		{ name: "mesh.refine", version: "1.1.0" },
		{ name: "mesh.refine", version: "1.1.0" }
	],
	capabilities: ["mesh.geometry"],
	resourceBudget: { operations: 4 }
});
assert.equal(tool.operations.length, 1);
assert.match(tool.manifestHash, /^fnv1a64:/);

const target = { artifactId: artifact.id, revision: 1, contentHash: artifact.contentHash };
const left = api.createSelectionArtifact({ target, domain: "vertex", elementIds: ["v2", "v1"] });
const right = api.createSelectionArtifact({ target, domain: "vertex", elementIds: ["v2", "v3"] });
assert.deepEqual(api.unionSelections(left, right).elementIds, ["v1", "v2", "v3"]);
assert.deepEqual(api.intersectSelections(left, right).elementIds, ["v2"]);
assert.deepEqual(api.subtractSelections(left, right).elementIds, ["v1"]);
assert.deepEqual(api.complementSelection(left, ["v1", "v2", "v3"]).elementIds, ["v3"]);

const measurement = api.measureCanonicalValue({ mesh: [1, 2, 3], label: "שלום" });
assert.equal(measurement.measurements.nodes > 0, true);
assert.equal(measurement.measurements.utf8Bytes > 0, true);
assert.match(measurement.contentHash, /^fnv1a64:/);

console.log('B"H | proceduralObjectFoundationIdentity.test passed');
