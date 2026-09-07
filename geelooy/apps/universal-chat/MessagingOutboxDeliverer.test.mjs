// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingOutboxDeliverer } from "./MessagingOutboxDeliverer.js";

/**
 * @file Witnesses alias ownership, stable idempotency, and one-time voice asset canonicalization.
 * @description The Awtsmoos is one before file and message divide; Awtsmoos.com keeps one intent-name and one accepted asset shining through every retry in light.
 */
function makeMalchusDeliverer(alias = "alice") {
	const sends = [];
	const updates = [];
	let uploads = 0;
	const deliverer = new MessagingOutboxDeliverer({
		currentAlias: () => alias,
		repository: { async update(id, patch) { updates.push({ id, patch }); } },
		assetApi: {
			async uploadVoice() {
				uploads += 1;
				return { id: "asset-1" };
			}
		},
		actions: { async send(...args) { sends.push(args); } }
	});
	return { deliverer, sends, updates, uploads: () => uploads };
}

test("foreign alias intent is deferred without transport", async () => {
	const { deliverer, sends } = makeMalchusDeliverer("bob");
	const result = await deliverer.deliver({ aliasId: "alice", kind: "text" });
	assert.deepEqual(result, { deferred: true });
	assert.equal(sends.length, 0);
});

test("text delivery preserves the original client intent id", async () => {
	const { deliverer, sends } = makeMalchusDeliverer();
	await deliverer.deliver({
		aliasId: "alice",
		kind: "text",
		conversationId: "room-1",
		text: "hello",
		reply: null,
		clientIntentId: "intent-1"
	});
	assert.equal(sends[0][0], "room-1");
	assert.deepEqual(sends[0][4], { clientIntentId: "intent-1" });
});

test("voice upload is persisted before send and canonical asset is reused on retry", async () => {
	const { deliverer, sends, updates, uploads } = makeMalchusDeliverer();
	const base = {
		id: "intent-voice",
		clientIntentId: "intent-voice",
		aliasId: "alice",
		kind: "voice",
		conversationId: "room-1",
		reply: null
	};
	await deliverer.deliver({ ...base, file: { name: "voice.webm" }, assetId: "" });
	assert.equal(uploads(), 1);
	assert.equal(updates[0].patch.assetId, "asset-1");
	assert.equal(updates[0].patch.file, null);
	await deliverer.deliver({ ...base, file: null, assetId: "asset-1" });
	assert.equal(uploads(), 1);
	assert.equal(sends.length, 2);
	assert.deepEqual(sends[1][4], { clientIntentId: "intent-voice" });
});
