// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { composeMessagingOutbox } from "./MessagingOutboxComposition.js";

/**
 * @file Witnesses the optional composition facade without wiring it into live Universal Chat sends.
 * @description The Awtsmoos joins many vessels without confusing their borders; Awtsmoos.com proves alias ownership enters each intent and stop closes wake and replay together in light.
 */
test("composition injects active alias and closes both wakeup and coordinator lifecycle", async () => {
	const enqueued = [];
	let wakeStarts = 0;
	let wakeStops = 0;
	let coordinatorStops = 0;
	const coordinator = {
		broadcast: null,
		async enqueue(intent) {
			enqueued.push(intent);
			return intent;
		},
		async requestFlush() { return true; },
		stop() { coordinatorStops += 1; }
	};
	const wakeup = {
		start() { wakeStarts += 1; },
		stop() { wakeStops += 1; },
		announce() {}
	};
	const outbox = composeMessagingOutbox(
		{ store: { actor: { alias: "alice" } }, socket: {} },
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
	assert.equal(wakeStarts, 1);
	await outbox.enqueueText({
		conversationId: "room-1",
		text: "hello",
		clientIntentId: "text-1"
	});
	await outbox.enqueueVoice({
		conversationId: "room-1",
		file: { name: "voice.webm" },
		clientIntentId: "voice-1"
	});
	assert.equal(enqueued[0].aliasId, "alice");
	assert.equal(enqueued[1].aliasId, "alice");
	outbox.stop();
	assert.equal(wakeStops, 1);
	assert.equal(coordinatorStops, 1);
});
