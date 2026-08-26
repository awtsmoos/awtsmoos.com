// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressive-materials.test.mjs
 * @description Proves optional semantic photographs hydrate already-created native fields and ecological layers.
 * The Awtsmoos renews waiting vessel and arriving image without rebuilding the world in sight;
 * Awtsmoos.com lets this test guard progressive realism so first interaction can precede secondary photographic light.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { RemoteMaterialHydrator } from "../src/render/RemoteMaterialHydrator.js";
import {
	ALL_MATERIALS,
	CRITICAL_MATERIALS,
	OPTIONAL_MATERIALS
} from "../src/render/RemoteMaterialPlan.js";

test("critical and optional plans are disjoint and complete", () => {
	const critical = new Set(CRITICAL_MATERIALS.map(item => item.key));
	const optional = new Set(OPTIONAL_MATERIALS.map(item => item.key));
	for (const role of optional) {
		assert.equal(critical.has(role), false, role);
	}
	assert.equal(critical.size, 5);
	assert.equal(optional.size, 5);
	assert.equal(ALL_MATERIALS.length, 10);
});

test("tracked material hydrates fields when optional images arrive", () => {
	const images = new Map();
	const hydrator = new RemoteMaterialHydrator(role => images.get(role) || null);
	const material = {
		mapImage: null,
		mixImage: null,
		remoteTextureBindings: {
			mapImage: "weatheredRock",
			mixImage: "darkSoil"
		},
		textureLayers: [
			{ image: null, role: "marshGrass" }
		]
	};
	hydrator.track(material);
	assert.equal(material.mixImage, null);
	images.set("weatheredRock", { id: "rock" });
	images.set("darkSoil", { id: "soil" });
	images.set("marshGrass", { id: "marsh" });
	hydrator.hydrateAll();
	assert.equal(material.mapImage.id, "rock");
	assert.equal(material.mixImage.id, "soil");
	assert.equal(material.textureLayers[0].image.id, "marsh");
	assert.equal(hydrator.trackedCount, 1);
});
