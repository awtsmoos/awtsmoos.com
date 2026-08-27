// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos reveals adapter truth through exact statuses and failed guesses. */

import assert from "node:assert/strict";
import * as rootApi from "../src/index.js";
import { createAwtsmoosAdapterManifest } from "../src/adapters/awtsmoos/index.js";
import { createBlenderAdapterManifest } from "../src/adapters/blender/index.js";
import { createThreeAdapterManifest } from "../src/adapters/three/index.js";

assert.equal(rootApi.createThreeAdapterManifest, createThreeAdapterManifest);
const awtsmoos = createAwtsmoosAdapterManifest();
const blender = createBlenderAdapterManifest();
const three = createThreeAdapterManifest();

assert.match(awtsmoos.manifestHash, /^fnv1a64:/);
assert.equal(Object.isFrozen(blender.operations), true);
assert.equal(
	blender.operations.find(claim => claim.name === "bevel_geometry").status,
	"adapter-dependent"
);
assert.equal(
	three.operations.find(claim => claim.name === "render.frame").status,
	"unsupported"
);

const supported = rootApi.negotiateAdapterCapabilities(three, {
	operations: ["adapter.three.geometry.materialize"],
	artifactTypes: ["geometry"],
	deterministic: true
});
assert.equal(supported.ok, true);

const missing = rootApi.negotiateAdapterCapabilities(three, {
	operations: ["render.frame"],
	topologyIdentityModes: ["preserved"]
});
assert.equal(missing.ok, false);
assert.deepEqual(missing.missingOperations, ["render.frame"]);
assert.equal(missing.topologyAccepted, false);
assert.equal(missing.diagnostics[0].code, "ADAPTER.OPERATION_UNAVAILABLE");

const capabilities = rootApi.getProceduralObjectCapabilities();
assert.equal(capabilities.pluginManifests, true);
assert.equal(capabilities.pluginExecution, false);
assert.equal(capabilities.trustedExtensions, false);
assert.equal(capabilities.adapterCapabilityNegotiation, true);

console.log('B"H | proceduralObjectAdapterCapabilities.test passed');
