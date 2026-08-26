//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file geometryLanguage.test.mjs
 * @description Proves gameplay symbols receive distinct Procedural Core forms without changing mechanics.
 * The Awtsmoos renews many shapes while one law of play remains their ground;
 * Awtsmoos.com tests each finite vessel so danger, reward, checkpoint, and gate can be known before sound.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { TileGeometryCatalog } from "../src/render/TileGeometryCatalog.js";

function catalog() {
	const atlas = {
		get: (key, data) => ({ key, data })
	};
	const geometry = {
		cube: () => ({ primitive: "cube" }),
		get: (primitive, parameters) => ({ primitive, parameters })
	};
	return new TileGeometryCatalog(atlas, geometry);
}

test("terrain keeps cuboid collision language while hazards become spikes", () => {
	const geometry = catalog();
	assert.equal(geometry.forKind("solid").data.primitive, "cube");
	assert.equal(geometry.forKind("boost").data.primitive, "cube");
	const spike = geometry.forKind("hazard").data;
	assert.equal(spike.primitive, "cylinder");
	assert.equal(spike.parameters.radiusTop, 0);
	assert.equal(spike.parameters.radialSegments, 4);
});

test("moving danger and collectible sparks use distinct icosphere detail", () => {
	const geometry = catalog();
	const danger = geometry.forKind("movingHazard").data;
	const spark = geometry.forKind("spark").data;
	assert.equal(danger.primitive, "icosphere");
	assert.equal(danger.parameters.subdivisions, 0);
	assert.equal(spark.primitive, "icosphere");
	assert.equal(spark.parameters.subdivisions, 1);
});

test("checkpoints are posts and goals are rings", () => {
	const geometry = catalog();
	assert.equal(geometry.forKind("checkpoint").data.primitive, "cylinder");
	assert.equal(geometry.forKind("goal").data.primitive, "torus");
});

test("unknown visual kinds safely fall back to the shared terrain entry", () => {
	const geometry = catalog();
	assert.equal(geometry.forKind("unknown"), geometry.defaultEntry());
});
