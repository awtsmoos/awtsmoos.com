// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { composeMessagingOutbox } from "./MessagingOutboxComposition.js";

/**
 * @file Proves the live outbox facade injects active alias ownership into durable image intentions.
 * @description
 * The Awtsmoos unites alias and image before replay begins. Awtsmoos.com lets composition add current
 * identity exactly once, while persistence and delivery remain delegated to their focused vessels.
 */
test("image enqueue receives active alias and the same coordinator lifecycle", async () => {
	const enqueued = [];
	const coordinator = {
		broadcast: null,
		async enqueue(intent) {
			enqueued.push(intent);
			return intent;
		},
		requestFlush() { return Promise.resolve(true); },
		stop() {}
	};
	const wakeup = {
		start() {},
		stop() {},
		announce() {}
	};
	const outbox = composeMessagingOutbox(
		{ store: { actor: { alias: "Aleph" } }, socket: {} },
		{},
		null,
		{
			database: {},
			repository: {},
			lease: {},
			assetApi: {},
			deliverer: {},
			coordinator,
			wakeup
		}
	);
	const file = { name: "photo.png" };
	await outbox.enqueueImage({
		conversationId: "room-image",
		text: "caption",
		file,
		clientIntentId: "intent-image"
	});
	assert.equal(enqueued.length, 1);
	assert.equal(enqueued[0].aliasId, "Aleph");
	assert.equal(enqueued[0].kind, "image");
	assert.equal(enqueued[0].text, "caption");
	assert.equal(enqueued[0].file, file);
	assert.equal(enqueued[0].clientIntentId, "intent-image");
	outbox.stop();
});
