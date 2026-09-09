// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingVoiceDelivery } from "./MessagingVoiceDelivery.js";

/**
 * @file Proves voice delivery saves the recording before reply context is cleared and retains direct fallback.
 * @description
 * The Awtsmoos preserves recorded breath before network acceptance. Awtsmoos.com witnesses durable
 * enqueue first, exact room/reply coordinates, failure preservation, and legacy direct canonical upload.
 */
function createFixture(options = {}) {
	const calls = [];
	const replyState = {
		cleared: 0,
		payload: () => ({ replyTo: "msg-source", replySequence: 7 }),
		clear() { this.cleared += 1; }
	};
	return {
		calls,
		replyState,
		store: { actor: { alias: "Aleph" } },
		current: () => ({ id: "room-voice" }),
		outbox: options.direct ? null : {
			async enqueueVoice(input) {
				calls.push({ stage: "enqueue", input });
				if (options.failSave) throw new Error("storage failed");
			}
		},
		assetApi: {
			async uploadVoice(alias, file) {
				calls.push({ stage: "upload", alias, file });
				return { id: "asset-voice-1" };
			}
		},
		actions: {
			async send(conversationId, text, reply, attachment) {
				calls.push({ stage: "send", conversationId, text, reply, attachment });
			}
		},
		onStage(label) {
			calls.push({ stage: "label", label });
		}
	};
}

test("durable voice delivery saves before clearing reply context", async () => {
	const fixture = createFixture();
	const delivery = new MessagingVoiceDelivery(fixture);
	const file = { name: "voice-note.webm" };
	assert.equal(await delivery.send({ file }), true);
	assert.equal(fixture.replyState.cleared, 1);
	assert.deepEqual(fixture.calls.find((row) => row.stage === "enqueue").input, {
		conversationId: "room-voice",
		file,
		reply: { replyTo: "msg-source", replySequence: 7 }
	});
	assert.equal(fixture.calls.some((row) => row.stage === "upload"), false);
	assert.equal(fixture.calls.some((row) => row.stage === "send"), false);
});
test("failed durable save preserves reply context for retry", async () => {
	const fixture = createFixture({ failSave: true });
	const delivery = new MessagingVoiceDelivery(fixture);
	await assert.rejects(
		() => delivery.send({ file: { name: "voice-note.webm" } }),
		/storage failed/
	);
	assert.equal(fixture.replyState.cleared, 0);
});

test("direct compatibility uploads canonical asset before websocket send", async () => {
	const fixture = createFixture({ direct: true });
	const delivery = new MessagingVoiceDelivery(fixture);
	const file = { name: "voice-note.webm" };
	assert.equal(await delivery.send({ file }), true);
	assert.equal(fixture.replyState.cleared, 1);
	assert.deepEqual(fixture.calls.at(-1), {
		stage: "send",
		conversationId: "room-voice",
		text: "",
		reply: { replyTo: "msg-source", replySequence: 7 },
		attachment: { assetId: "asset-voice-1" }
	});
});
