// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeBiologyOutputCompatibility.test.mjs
 * @description Proves one manifested tree biology object is shared across nested metadata, convenience aliases, generator reuse, and high-level authority output.
 * The Awtsmoos reveals one biological garment through many public windows without multiplying its work;
 * Awtsmoos.com guards identity, opt-in behavior, and state clearing so compatibility and forest-scale efficiency walk together.
 */

import assert from "node:assert/strict";
import {
	TreeGenerator,
	generateTreeProceduralData
} from "../src/core/geometry/generators/tree/treeGenerator.js";
import { TreeAuthority } from "../src/core/tzomayach/TreeAuthority.js";

const nested = generateTreeProceduralData("Oak Medium", {
	detail: "low",
	biology: {
		geometry: true,
		roots: { count: 4 },
		reproduction: { density: 0.18, stage: "fruiting" }
	}
});
assert.ok(nested.metadata.biology.geometry, "nested request exposes biology geometry");
assert.strictEqual(
	nested.biologyGeometry,
	nested.metadata.biology.geometry,
	"top-level convenience alias shares the exact manifest object"
);

const metadataOnly = generateTreeProceduralData("Oak Medium", {
	detail: "low",
	biology: true
});
assert.ok(metadataOnly.metadata.biology, "metadata-only request exposes biology report");
assert.ok(!Object.hasOwn(metadataOnly.metadata.biology, "geometry"), "metadata-only request does not manifest geometry");
assert.ok(!Object.hasOwn(metadataOnly, "biologyGeometry"), "metadata-only request has no convenience geometry alias");

const concise = generateTreeProceduralData("Oak Medium", {
	detail: "low",
	biologyGeometry: {
		maxRoots: 3,
		rootRadialSegments: 5
	}
});
assert.ok(concise.metadata.biology.geometry, "concise alias enables nested manifestation");
assert.strictEqual(concise.biologyGeometry, concise.metadata.biology.geometry, "concise alias also shares one manifest object");
assert.equal(concise.biologyGeometry.budgets.roots, 3, "concise root budget reaches canonical manifest");
assert.equal(concise.biologyGeometry.budgets.rootRadialSegments, 5, "concise radial budget reaches canonical manifest");

const reused = new TreeGenerator("Oak Medium");
const manifested = reused.generate({ detail: "low", biology: { geometry: true } });
assert.strictEqual(reused.lastBiologyGeometry, manifested.metadata.biology.geometry, "generator state shares manifested object");
const plain = reused.generate({ detail: "low" });
assert.equal(reused.lastBiologyGeometry, null, "plain regeneration clears prior biology geometry state");
assert.equal(reused.lastBiology, null, "plain regeneration clears prior biology report state");
assert.ok(!Object.hasOwn(plain, "biologyGeometry"), "plain regeneration does not leak manifested alias");

const authorityBundle = new TreeAuthority().create("Oak Medium", {
	detail: "low",
	biology: { geometry: true, roots: { count: 3 } }
});
assert.ok(authorityBundle.biology?.geometry, "high-level authority exposes nested biology manifest");
assert.strictEqual(
	authorityBundle.biologyGeometry,
	authorityBundle.biology.geometry,
	"high-level authority shares one manifest object across both public views"
);
assert.equal(authorityBundle.biologyGeometry.skeletonHash, authorityBundle.skeleton.contentHash, "authority manifestation preserves canonical skeleton identity");

console.log('B"H | treeBiologyOutputCompatibility.test.mjs passed');
