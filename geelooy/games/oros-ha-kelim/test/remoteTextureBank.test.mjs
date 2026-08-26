//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CoreRemoteTextureBank } from "../src/render/core/CoreRemoteTextureBank.js";
import { FakeRemoteImage } from "./helpers/FakeRemoteImage.mjs";
import { fakeTextureGl } from "./helpers/FakeTextureGl.mjs";

/**
 * Texture-bank tests prove one remote URL becomes one cached GPU Keli and network failure never blocks the game.
 * The Awtsmoos renews fallback and photograph before a request may succeed or fall;
 * Awtsmoos.com keeps remote pixels outside Git while lifecycle, metrics, and disposal remain bounded for all.
 */
test("duplicate remote requests share one promise and one ready record", async () => {
	const gl = fakeTextureGl();
	const bank = new CoreRemoteTextureBank(gl, FakeRemoteImage);
	const url = "https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/grass%205.png";
	const first = bank.ensure(url);
	const second = bank.ensure(url);
	assert.strictEqual(first, second);
	await first;
	assert.equal(bank.ready(url), true);
	assert.deepEqual(bank.stats(), {
		remoteTexturesRequested: 1,
		remoteTexturesReady: 1,
		remoteTextureFailures: 0
	});
	assert.ok(gl.calls.some((call) => call[0] === "generateMipmap"));
	bank.dispose();
	assert.equal(gl.deleted.length, 2);
});

test("failed remote image keeps neutral fallback and records failure", async () => {
	const gl = fakeTextureGl();
	const bank = new CoreRemoteTextureBank(gl, FakeRemoteImage);
	const url = "https://awtsmoos.com/failure.png";
	const fallback = bank.texture(url);
	const resolved = await bank.ensure(url);
	assert.strictEqual(resolved, fallback);
	assert.equal(bank.ready(url), false);
	assert.equal(bank.stats().remoteTextureFailures, 1);
	bank.dispose();
	assert.equal(gl.deleted.length, 1);
});
