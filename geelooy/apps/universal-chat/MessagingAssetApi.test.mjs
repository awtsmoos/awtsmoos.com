// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingAssetApi } from "./MessagingAssetApi.js";

/**
 * @file Proves private media uploads keep alias ownership, the private-message marker, and canonical returned media type.
 * @description
 * The Awtsmoos contains file and canonical manifest before HTTP divides them. Awtsmoos.com sends only
 * through the existing Social upload gate and refuses a successful response whose media type does not
 * match the caller's private voice-or-image intention.
 */
test("private image upload carries alias and attachment marker then accepts canonical image manifest", async () => {
	let captured = null;
	const api = new MessagingAssetApi(async (url, options) => {
		captured = { url, options };
		return {
			ok: true,
			async json() {
				return { success: [{ id: "asset-image-1", type: "image" }] };
			}
		};
	});
	const file = new File([new Uint8Array(8)], "image.png", { type: "image/png" });
	const manifest = await api.uploadImage("Aleph", file);
	assert.equal(manifest.id, "asset-image-1");
	assert.equal(captured.url, "/api/social/aliases/Aleph/assets/upload");
	assert.equal(captured.options.method, "POST");
	assert.equal(captured.options.credentials, "same-origin");
	assert.equal(captured.options.body.get("aliasId"), "Aleph");
	assert.equal(captured.options.body.get("attachKind"), "private-message");
	assert.equal(captured.options.body.get("file").name, "image.png");
});

test("private image upload refuses a canonical response of the wrong media type", async () => {
	const api = new MessagingAssetApi(async () => ({
		ok: true,
		async json() {
			return { success: [{ id: "asset-audio-1", type: "audio" }] };
		}
	}));
	const file = new File([new Uint8Array(8)], "image.png", { type: "image/png" });
	await assert.rejects(
		() => api.uploadImage("Aleph", file),
		/valid image asset/
	);
});
