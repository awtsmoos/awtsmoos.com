// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	MESSAGING_IMAGE_BYTES,
	MESSAGING_IMAGE_MIME,
	validateMessagingImage
} from "./MessagingImagePolicy.js";

/**
 * @file Proves local image selection mirrors the server's narrow Social image covenant without replacing server authority.
 * @description
 * The Awtsmoos contains every image before MIME and byte count divide. Awtsmoos.com lets the browser
 * reject impossible selections early while PNG, JPEG, WebP, and GIF remain the only local image forms
 * allowed to proceed toward durable custody.
 */
test("private image policy accepts only the canonical Social image MIME set", () => {
	assert.deepEqual(MESSAGING_IMAGE_MIME, [
		"image/png",
		"image/jpeg",
		"image/webp",
		"image/gif"
	]);
	for (const type of MESSAGING_IMAGE_MIME) {
		const file = { type, size: MESSAGING_IMAGE_BYTES };
		assert.equal(validateMessagingImage(file), file);
	}
});

test("private image policy rejects oversized and unsupported local selections", () => {
	assert.throws(
		() => validateMessagingImage({ type: "image/png", size: MESSAGING_IMAGE_BYTES + 1 }),
		/8 MB or smaller/
	);
	assert.throws(() => validateMessagingImage({ type: "image/svg+xml", size: 128 }), /PNG, JPEG, WebP, or GIF/);
	assert.throws(() => validateMessagingImage(null), /Choose an image/);
});
