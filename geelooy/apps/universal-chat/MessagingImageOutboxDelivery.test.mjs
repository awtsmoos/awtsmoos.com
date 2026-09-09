// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingOutboxDeliverer } from "./MessagingOutboxDeliverer.js";

/**
 * @file Proves durable private images upload once, persist canonical identity, preserve caption, and reuse the original message intent.
 * @description
 * The Awtsmoos is one before local File, canonical asset, and websocket retry divide. Awtsmoos.com
 * persists the first accepted image id before transport so later wounds repeat neither media upload
 * nor human intention, and a foreign active alias receives no authority over the queued vessel.
 */
function fixture(alias = "Aleph") {
	const sends = [];
	const updates = [];
	let uploads = 0;
	const deliverer = new MessagingOutboxDeliverer({
		currentAlias: () => alias,
		repository: {
			async update(id, patch) { updates.push({ id, patch }); }
		},
		assetApi: {
			async uploadImage(owner, file) {
				uploads += 1;
				assert.equal(owner, "Aleph");
				assert.equal(file.name, "photo.png");
				return { id: "asset-image-canonical" };
			}
		},
		actions: {
			async send(...args) { sends.push(args); }
		}
	});
	return {
		deliverer,
		sends,
		updates,
		uploads: () => uploads
	};
}

test("image upload canonicalizes once and caption survives every websocket retry", async () => {
	const { deliverer, sends, updates, uploads } = fixture();
	const base = {
		id: "intent-image",
		clientIntentId: "intent-image",
		aliasId: "Aleph",
		kind: "image",
		conversationId: "room-image",
		text: "A caption",
		reply: { replyTo: "msg-source", replySequence: 3 }
	};
	await deliverer.deliver({
		...base,
		file: { name: "photo.png" },
		assetId: ""
	});
	assert.equal(uploads(), 1);
	assert.equal(updates[0].patch.assetId, "asset-image-canonical");
	assert.equal(updates[0].patch.file, null);
	assert.equal(sends[0][0], "room-image");
	assert.equal(sends[0][1], "A caption");
	assert.deepEqual(sends[0][3], { assetId: "asset-image-canonical" });
	assert.deepEqual(sends[0][4], { clientIntentId: "intent-image" });
	await deliverer.deliver({
		...base,
		file: null,
		assetId: "asset-image-canonical"
	});
	assert.equal(uploads(), 1);
	assert.equal(sends.length, 2);
	assert.equal(sends[1][1], "A caption");
	assert.deepEqual(sends[1][3], { assetId: "asset-image-canonical" });
});

test("foreign active alias defers image delivery before upload or transport", async () => {
	const { deliverer, sends, uploads } = fixture("Bet");
	const result = await deliverer.deliver({
		aliasId: "Aleph",
		kind: "image",
		file: { name: "photo.png" }
	});
	assert.deepEqual(result, { deferred: true });
	assert.equal(uploads(), 0);
	assert.equal(sends.length, 0);
});
