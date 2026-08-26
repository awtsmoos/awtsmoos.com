// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each biological vessel while no species owns its light;
 * Awtsmoos.com verifies that mouth assemblies and feather tracts remain public,
 * immutable, deterministic, and independently composable through the root API.
 */

import assert from "node:assert/strict";
import {
	createCoveringDistributionPlan,
	createDaasOralAssembly,
	createFeatherLayerCatalog,
	createFeatherLayerProfile,
	listFeatherLayerIds
} from "../src/index.js";

const oralAssembly = createDaasOralAssembly();
const oralSlots = oralAssembly.entries.map(entry => entry.metadata.assemblySlot);
assert.equal(oralAssembly.type, "biological-feature-assembly");
assert.equal(oralAssembly.coordinateSpace, "local-mouth-plane");
assert.equal(oralAssembly.metadata.targetAgnostic, true);
assert.ok(oralSlots.includes("mouth"));
assert.ok(oralSlots.includes("upper-gum"));
assert.ok(oralSlots.includes("lower-gum"));
assert.ok(oralSlots.includes("upper-dentition"));
assert.ok(oralSlots.includes("lower-dentition"));
assert.ok(oralSlots.includes("tongue"));
assert.ok(oralSlots.includes("palate"));
assert.ok(oralAssembly.entries.every(entry => entry.target === "assembly-surface"));

const expectedLayers = [
	"down",
	"contour",
	"primary",
	"secondary",
	"covert",
	"tail",
	"display",
	"crest",
	"facial",
	"neck"
];
assert.deepEqual(listFeatherLayerIds(), expectedLayers);

const firstCatalog = createFeatherLayerCatalog();
const secondCatalog = createFeatherLayerCatalog();
assert.deepEqual(firstCatalog, secondCatalog);
assert.equal(firstCatalog.primary.type, "feather_field");
assert.equal(firstCatalog.primary.region, "wing.primary");
assert.equal(Object.isFrozen(firstCatalog), true);
assert.equal(Object.isFrozen(firstCatalog.primary), true);

const customPrimary = createFeatherLayerProfile("primary", {
	density: 0.42,
	length: 0.5,
	material: { role: "flight_feather" }
});
assert.equal(customPrimary.density, 0.42);
assert.equal(customPrimary.length, 0.5);
assert.equal(customPrimary.material.role, "flight_feather");
assert.throws(() => createFeatherLayerProfile("unknown"), /Unsupported feather layer/);

const firstPlan = createCoveringDistributionPlan(customPrimary, "high", "feather-seed");
const secondPlan = createCoveringDistributionPlan(customPrimary, "high", "feather-seed");
assert.deepEqual(firstPlan, secondPlan);
assert.equal(firstPlan.seed, "feather-seed");
assert.equal(firstPlan.representation, "feather_instances");

console.log('B"H | creatureBiologicalLanguage.test.mjs passed');
