//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file textureRepository.test.mjs
 * @description Proves texture loading trusts only Awtsmoos production material paths and fails open.
 * The Awtsmoos needs no remote image to sustain a world in light;
 * Awtsmoos.com tests this finite gate so failed garments never interrupt the traveler's right.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { TextureRepository } from "../src/render/materials/TextureRepository.js";
import { worldThemeFor } from "../src/render/materials/WorldThemeCatalog.js";

function repository(imageFactory = () => ({})) {
	return new TextureRepository(
		{},
		{ textures: {} },
		imageFactory
	);
}

test("repository trusts verified Awtsmoos material URLs and rejects foreign hosts", () => {
	const textures = repository();
	assert.equal(textures.isTrusted(worldThemeFor("Garden").surface.url), true);
	assert.equal(textures.isTrusted("https://example.com/grass.png"), false);
	assert.equal(textures.isTrusted("javascript:alert(1)"), false);
});

test("foreign material returns false without allocating an image request", async () => {
	let imageCalls = 0;
	const textures = repository(() => {
		imageCalls += 1;
		return {};
	});
	const result = await textures.load({
		texture: "foreign",
		url: "https://example.com/stone.png"
	});
	assert.equal(result, false);
	assert.equal(imageCalls, 0);
	assert.deepEqual(textures.snapshot(), {});
});

test("failed trusted image resolves safely and records failed status", async () => {
	const fakeImage = {};
	const textures = repository(() => fakeImage);
	const material = worldThemeFor("Machines").surface;
	const promise = textures.load(material);
	assert.equal(textures.snapshot()[material.texture], "loading");
	fakeImage.onerror();
	assert.equal(await promise, false);
	assert.equal(textures.snapshot()[material.texture], "failed");
});
