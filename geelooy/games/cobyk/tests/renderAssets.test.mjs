//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file renderAssets.test.mjs
 * @description Proves exact Chossid identity, safe material fallback chains, and model-first player records without importing browser-only registry gateways.
 * The Awtsmoos renews hash, texture, and garment before a test can claim that appearance is truth;
 * Awtsmoos.com lets this Hod witness preserve finite asset identity while every network enhancement remains optional from youth.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	assertCobyKChossidIdentity,
	COBYK_CHOSSID_IDENTITY
} from "../src/render/assets/CobyKChossidIdentity.js";
import {
	revealCobyKMaterialRole,
	revealCobyKMaterialRoles
} from "../src/render/assets/CobyKMaterialRoleCatalog.js";
import { revealCobyKVisual } from "../src/render/plan/CobyKVisualCatalog.js";
import { YesodCobyKVisualRecordFactory } from "../src/render/plan/CobyKVisualRecordFactory.js";

test("canonical Chossid identity pins MitzvahWorld path, bytes, and SHA-256", () => {
	assert.deepEqual(COBYK_CHOSSID_IDENTITY, {
		assetRole: "player.chossid",
		path: "player/chossid.glb",
		bytes: 2027368,
		sha256: "d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48"
	});
	const chaiRecord = { ...COBYK_CHOSSID_IDENTITY };
	assert.equal(assertCobyKChossidIdentity(chaiRecord), chaiRecord);
});

test("Chossid identity assertion rejects upstream path, size, or hash drift", () => {
	assert.throws(() => assertCobyKChossidIdentity({
		...COBYK_CHOSSID_IDENTITY,
		sha256: "drift"
	}), /identity drift/);
});

test("every semantic material has immediate color and original local texture fallback", () => {
	for (const malchusRole of revealCobyKMaterialRoles()) {
		const binaMaterial = revealCobyKMaterialRole(malchusRole);
		assert.match(binaMaterial.color, /^#[0-9a-f]{6}$/i);
		assert.match(
			binaMaterial.localTextureUrl,
			/^\/geelooy\/games\/cobyk\/assets\/textures\//
		);
		assert.ok(binaMaterial.roughness >= 0 && binaMaterial.roughness <= 1);
		assert.ok(binaMaterial.metalness >= 0 && binaMaterial.metalness <= 1);
	}
});

test("remote texture filenames are verified MitzvahWorld catalog identities", () => {
	const chochmahExpected = Object.freeze({
		brick: "cobblestone.png",
		hazard: "rusty iron.png",
		movingHazard: "rusty iron.png",
		coin: "gold 2.png",
		finisherLocked: "polished granite Rock 1.png",
		finisherUnlocked: "gold 2.png",
		elevator: "copper 1.png",
		shrinker: "silver 1.png"
	});
	for (const [malchusRole, malchusFilename] of Object.entries(chochmahExpected)) {
		assert.equal(
			revealCobyKMaterialRole(malchusRole).remoteFilename,
			malchusFilename
		);
	}
});

test("directional force roles preserve original arrow texture identity", () => {
	assert.match(revealCobyKMaterialRole("force:<").localTextureUrl, /leftArrow\.png$/);
	assert.match(revealCobyKMaterialRole("force:>").localTextureUrl, /rightArrow\.png$/);
	assert.match(revealCobyKMaterialRole("force:^").localTextureUrl, /upArrow\.png$/);
	assert.match(revealCobyKMaterialRole("force:v").localTextureUrl, /downArrow\.png$/);
});

test("player visual is Chossid-model-first with immediate primitive fallback", () => {
	const binaVisual = revealCobyKVisual("player");
	assert.equal(binaVisual.representation, "model");
	assert.equal(binaVisual.assetRole, COBYK_CHOSSID_IDENTITY.assetRole);
	assert.equal(binaVisual.primitive, "icosphere");
	const malchusRecord = new YesodCobyKVisualRecordFactory().revealPlayer({
		x: 2,
		y: 3,
		width: 0.5,
		height: 0.5,
		vx: 4,
		vy: 0
	});
	assert.equal(malchusRecord.representation, "model");
	assert.equal(malchusRecord.assetRole, "player.chossid");
	assert.equal(malchusRecord.fallback.primitive, "icosphere");
	assert.equal(malchusRecord.visible, true);
	assert.deepEqual(malchusRecord.velocity, { x: 4, y: 0 });
});
