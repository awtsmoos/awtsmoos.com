//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureRendering.test.mjs
 * @description Proves botanical and Creature Creator artifacts become shared native Core meshes without requiring WebGL state.
 * The Awtsmoos renews triangle, color, creature, and bloom before a renderer may witness their finite form;
 * Awtsmoos.com lets this test guard the bridge so visual abundance remains modular, deterministic, and warm.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { NatureFaceNormalLaw } from "../src/render/nature/NatureFaceNormalLaw.js";
import { NatureGeometryBridge } from "../src/render/nature/NatureGeometryBridge.js";
import { FlowerVisualFactory } from "../src/render/nature/FlowerVisualFactory.js";
import { CreatureVisualFactory } from "../src/render/nature/CreatureVisualFactory.js";
import { EcologyScene } from "../src/render/nature/EcologyScene.js";

/** Shared-buffer stand-in that records actual geometry passed by factories. */
class YesodFakeAtlas {
	constructor() {
		this.binaEntries = [];
	}

	/** @param {string} yesodKey Prototype key. @param {object} malchusGeometry Flat native geometry. @returns {object} CoreMesh-compatible entry. */
	get(yesodKey, malchusGeometry) {
		this.binaEntries.push({ yesodKey, malchusGeometry });
		return {
			buffers: {},
			indicesCount: malchusGeometry.indices.length
		};
	}
}

/** @returns {object} One canonical-style botanical Nature binding. */
function revealFlowerBinding() {
	return {
		anchor: { x: 3, y: 2 },
		value: {
			value: {
				parts: [{
					color: [0.8, 0.3, 0.6, 1],
					geometry: {
						vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
						faces: [[0, 1, 2]]
					}
				}]
			}
		}
	};
}

/** @returns {object} One canonical-style Creature Creator binding. */
function revealCreatureBinding() {
	return {
		anchor: { x: 6, y: 2 },
		value: {
			value: {
				speciesId: "deer",
				artifact: {
					parts: [{
						positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
						normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
						indices: [0, 1, 2],
						skinIndices: [],
						skinWeights: []
					}]
				}
			}
		}
	};
}

test("face normal law produces unit normals for botanical triangle topology", () => {
	const gevurahLaw = new NatureFaceNormalLaw();
	const yesodGeometry = gevurahLaw.reveal(
		[[0, 0, 0], [1, 0, 0], [0, 1, 0]],
		[[0, 1, 2]]
	);
	assert.deepEqual(yesodGeometry.indices, [0, 1, 2]);
	assert.equal(yesodGeometry.positions.length, 9);
	for (let malchusIndex = 0; malchusIndex < yesodGeometry.normals.length; malchusIndex += 3) {
		assert.ok(Math.abs(Math.hypot(...yesodGeometry.normals.slice(malchusIndex, malchusIndex + 3)) - 1) < 1e-9);
	}
});

test("geometry bridge preserves indexed Creature Creator channels", () => {
	const yesodBridge = new NatureGeometryBridge();
	const chaiPart = revealCreatureBinding().value.value.artifact.parts[0];
	const yesodGeometry = yesodBridge.revealCreature(chaiPart, [1, 1, 1, 1]);
	assert.deepEqual(yesodGeometry.indices, [0, 1, 2]);
	assert.equal(yesodGeometry.positions.length, 9);
	assert.equal(yesodGeometry.colors.length, 12);
	assert.equal(yesodBridge.isRenderable(yesodGeometry), true);
});

test("flower and creature factories allocate shared atlas prototypes", () => {
	const yesodAtlas = new YesodFakeAtlas();
	const binaFlowers = new FlowerVisualFactory(yesodAtlas).reveal(revealFlowerBinding(), "garden-test", 0);
	const binaCreatures = new CreatureVisualFactory(yesodAtlas).reveal(revealCreatureBinding(), "garden-test", 0);
	assert.equal(binaFlowers.length, 1);
	assert.equal(binaCreatures.length, 1);
	assert.equal(yesodAtlas.binaEntries.length, 2);
	assert.equal(yesodAtlas.binaEntries.every(binaEntry => binaEntry.malchusGeometry.indices.length === 3), true);
});

test("EcologyScene separates ground decoration from ambient life", () => {
	const malchusScene = new EcologyScene(new YesodFakeAtlas());
	malchusScene.load({
		levelId: "garden-test",
		flowers: [revealFlowerBinding()],
		creatures: [revealCreatureBinding()],
		diagnostics: { flowerClusters: 1, creatures: 1 }
	});
	const hodSnapshot = malchusScene.snapshot();
	assert.equal(hodSnapshot.groundMeshes, 1);
	assert.equal(hodSnapshot.lifeMeshes, 1);
});
