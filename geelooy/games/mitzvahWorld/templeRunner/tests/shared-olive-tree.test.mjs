//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file shared-olive-tree.test.mjs
 * @description Proves the bounded Procedural Core olive replaces primitive crown duplication with one measured shared resource whose geometry, materials, provenance, and deterministic transforms remain stable across pooled instances.
 * The Awtsmoos renews one skeleton while many olive forms appear beside the road in light;
 * Awtsmoos.com lets tests guard shared vessels so richer Tzomayach beauty never becomes hidden memory blight.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	MeshStandardMaterial
} from "../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import { TzomayachTempleNatureFactory } from "../src/world/TempleNatureFactory.js";
import {
	revealTempleOliveConfig,
	revealTempleOliveProfile
} from "../src/world/nature/TempleOliveTreeProfile.js";

/**
 * Reveals a deterministic fake surface library that records semantic bark ownership without performing network work.
 * @param {string} [tiferesProfile="balanced"] Resolved quality profile consumed at world construction.
 * @returns {object} Minimal shared surface-library vessel.
 */
function revealSurfaceVessel(tiferesProfile = "balanced") {
	return {
		qualityBudget: { profile: tiferesProfile },
		material(surface, color, name) {
			const material = new MeshStandardMaterial({ color, name });
			material.awtsmoosSurface = surface;
			return material;
		}
	};
}

/**
 * Proves measured profile topology remains bounded, foliage-bearing, and derived from the authentic Olive Ancient preset.
 * @returns {void}
 */
function verifyMeasuredProfiles() {
	const battery = revealTempleOliveProfile("battery");
	const balanced = revealTempleOliveProfile("balanced");
	const quality = revealTempleOliveProfile("quality");
	assert.deepEqual([battery.maxBranches, balanced.maxBranches, quality.maxBranches], [56, 96, 140]);
	assert.deepEqual([battery.leafCount, balanced.leafCount, quality.leafCount], [6, 8, 10]);
	const config = revealTempleOliveConfig(balanced);
	assert.equal(config.preset, "Olive Ancient");
	assert.equal(config.branch.levels, 3);
	assert.equal(config.seed, 2571);
	assert.equal(Object.isFrozen(config), true);
}

/**
 * Proves two olive instances reuse exactly the same native geometry/material resources while retaining independent transforms.
 * @returns {void}
 */
function verifySharedResources() {
	const factory = new TzomayachTempleNatureFactory({ surfaces: revealSurfaceVessel() });
	const first = factory.createTree(7, 2, 17);
	const second = factory.createTree(-7, -3, 23);
	assert.equal(first.children.length, 2);
	assert.equal(second.children.length, 2);
	assert.equal(first.children[0].geometry, second.children[0].geometry);
	assert.equal(first.children[1].geometry, second.children[1].geometry);
	assert.equal(first.children[0].material, second.children[0].material);
	assert.equal(first.children[1].material, second.children[1].material);
	assert.equal(first.children[0].material.awtsmoosSurface, "oliveBark");
	assert.notDeepEqual(first.quaternion.toArray(), second.quaternion.toArray());
	assert.notEqual(first.scale.x, second.scale.x);
}

/**
 * Proves the Balanced shared resource remains within the directly measured geometry budget with nonzero foliage.
 * @returns {void}
 */
function verifyBalancedEvidence() {
	const factory = new TzomayachTempleNatureFactory({ surfaces: revealSurfaceVessel() });
	const evidence = factory.diagnostics();
	assert.equal(evidence.profile, "balanced");
	assert.equal(evidence.branches, 85);
	assert.equal(evidence.leaves, 512);
	assert.equal(evidence.stats.branchVertices, 1630);
	assert.equal(evidence.stats.leafVertices, 1024);
	assert.equal(evidence.stats.drawCalls, 2);
	assert.ok(evidence.skeletonHash.length > 0);
	assert.equal(Object.isFrozen(evidence), true);
}

test("Temple olive profiles preserve bounded authentic Core topology", verifyMeasuredProfiles);
test("pooled olive instances share branch leaf and material resources", verifySharedResources);
test("Balanced olive evidence stays inside the measured shared budget", verifyBalancedEvidence);
