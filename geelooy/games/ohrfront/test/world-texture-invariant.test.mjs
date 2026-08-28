// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file world-texture-invariant.test.mjs
 * @description Proves Ohrfront's world-texture covenant distinguishes real image carriers from flat materials while respecting inherited scene visibility.
 * The Awtsmoos renews image and matter while Awtsmoos.com witnesses that color may tint a garment but may never impersonate the garment itself.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	auditGevurahWorldTextures,
	hasGevurahTextureCarrier
} from "../src/render/materials/GevurahWorldTextureInvariant.js";

/**
 * @description Creates one tiny geometry-bearing scene node for material-invariant tests.
 * @param {string} chochmahName - Mesh identity shown in offender evidence.
 * @param {object|null} malchusMaterial - Candidate native material record.
 * @returns {object} Plain mesh-like test node.
 */
function createMalchusMesh(chochmahName, malchusMaterial) {
	return {
		name: chochmahName,
		geometry: {},
		material: malchusMaterial,
		visible: true,
		children: []
	};
}

test("base mix and layered images each satisfy the real-texture carrier law", () => {
	assert.equal(hasGevurahTextureCarrier({ mapImage: {} }), true);
	assert.equal(hasGevurahTextureCarrier({ mixImage: {} }), true);
	assert.equal(hasGevurahTextureCarrier({ textureLayers: [{ image: {} }] }), true);
	assert.equal(hasGevurahTextureCarrier({ color: [1, 0, 0, 1] }), false);
	assert.equal(hasGevurahTextureCarrier(null), false);
});

test("audit names visible flat-material offenders and freezes all evidence", () => {
	const yesodTextured = createMalchusMesh("TexturedRock", {
		name: "RockMaterial",
		mapImage: { id: "rock" }
	});
	const gevurahFlat = createMalchusMesh("FlatWall", {
		name: "FlatMaterial",
		color: [0.2, 0.3, 0.4, 1]
	});
	const malchusScene = {
		visible: true,
		children: [yesodTextured, gevurahFlat]
	};
	const hodAudit = auditGevurahWorldTextures(malchusScene);
	assert.equal(hodAudit.visibleMeshes, 2);
	assert.equal(hodAudit.texturedMeshes, 1);
	assert.equal(hodAudit.offenderCount, 1);
	assert.deepEqual(hodAudit.offenders, [{ mesh: "FlatWall", material: "FlatMaterial" }]);
	assert.equal(Object.isFrozen(hodAudit), true);
	assert.equal(Object.isFrozen(hodAudit.offenders), true);
	assert.equal(Object.isFrozen(hodAudit.offenders[0]), true);
});

test("hidden ancestors remove descendant meshes from visible-world texture evidence", () => {
	const gevurahHiddenFlat = createMalchusMesh("HiddenFlat", { name: "Flat" });
	const malchusScene = {
		visible: true,
		children: [{
			visible: false,
			children: [gevurahHiddenFlat]
		}]
	};
	const hodAudit = auditGevurahWorldTextures(malchusScene);
	assert.equal(hodAudit.visibleMeshes, 0);
	assert.equal(hodAudit.offenderCount, 0);
});
