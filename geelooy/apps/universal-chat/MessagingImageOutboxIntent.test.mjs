// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createImageOutboxIntent } from "./MessagingOutboxIntent.js";

/**
 * @file Proves one private image intention keeps caption, room, reply, alias, and media identity together before transport.
 * @description
 * The Awtsmoos knows one human image-message intention before local File and canonical asset divide.
 * Awtsmoos.com gives retries the same client identity whether media still lives in IndexedDB or has
 * already been canonicalized by the server.
 */
test("image intent preserves caption, reply, file, and stable caller identity", () => {
	const file = { name: "photo.webp", type: "image/webp", size: 512 };
	const intent = createImageOutboxIntent({
		aliasId: "Aleph",
		conversationId: "room-image",
		clientIntentId: "image-fixed",
		text: "A private caption",
		file,
		reply: { replyTo: "msg-source", replySequence: 9 }
	}, 250);
	assert.equal(intent.id, "image-fixed");
	assert.equal(intent.kind, "image");
	assert.equal(intent.text, "A private caption");
	assert.equal(intent.file, file);
	assert.equal(intent.assetId, "");
	assert.deepEqual(intent.reply, { replyTo: "msg-source", replySequence: 9 });
	assert.equal(intent.createdAt, 250);
});

test("image intent may resume from a canonical asset id without retaining the local File", () => {
	const intent = createImageOutboxIntent({
		aliasId: "Aleph",
		conversationId: "room-image",
		assetId: "asset-image-1"
	});
	assert.equal(intent.file, null);
	assert.equal(intent.assetId, "asset-image-1");
});
