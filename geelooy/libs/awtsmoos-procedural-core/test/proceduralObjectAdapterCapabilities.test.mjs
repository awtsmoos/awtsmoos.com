//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Public adapter capability contract.
 * @description
 * The Awtsmoos joins request and vessel only where support is truly declared, never where an old renderer once stood;
 * Awtsmoos.com proves native runtime and Blender planning capabilities negotiate honestly through one public root for good.
 */

import assert from "node:assert/strict";
import * as rootApi from "../src/index.js";
import { createAwtsmoosAdapterManifest } from "../src/adapters/awtsmoos/index.js";
import { createBlenderAdapterManifest } from "../src/adapters/blender/index.js";

assert.equal(
	rootApi.createAwtsmoosAdapterManifest,
	createAwtsmoosAdapterManifest
);
assert.equal(
	rootApi.createBlenderAdapterManifest,
	createBlenderAdapterManifest
);

const awtsmoos = createAwtsmoosAdapterManifest();
const blender = createBlenderAdapterManifest();

assert.match(awtsmoos.manifestHash, /^fnv1a64:/);
assert.equal(Object.isFrozen(blender.operations), true);
const deferredBevel = blender.operations.find(claim => {
	return claim.name === "bevel_geometry";
});
assert.equal(deferredBevel.status, "adapter-dependent");

const supported = rootApi.negotiateAdapterCapabilities(awtsmoos, {
	operations: ["adapter.awtsmoos.geometry.materialize"],
	artifactTypes: ["geometry"],
	deterministic: true
});
assert.equal(supported.ok, true);
assert.equal(supported.adapterId, "adapter.awtsmoos.runtime");
assert.equal(supported.supportedOperations.length, 1);

const missing = rootApi.negotiateAdapterCapabilities(awtsmoos, {
	operations: ["render.frame"],
	topologyIdentityModes: ["preserved"]
});
assert.equal(missing.ok, false);
assert.deepEqual(missing.missingOperations, ["render.frame"]);
assert.equal(missing.topologyAccepted, false);
assert.equal(
	missing.diagnostics[0].code,
	"ADAPTER.OPERATION_UNAVAILABLE"
);
assert.equal(
	missing.diagnostics[1].code,
	"ADAPTER.TOPOLOGY_IDENTITY_UNAVAILABLE"
);

const capabilities = rootApi.getProceduralObjectCapabilities();
assert.equal(capabilities.pluginManifests, true);
assert.equal(capabilities.pluginExecution, false);
assert.equal(capabilities.trustedExtensions, false);
assert.equal(capabilities.adapterCapabilityNegotiation, true);

console.log('B"H | proceduralObjectAdapterCapabilities.test passed');
