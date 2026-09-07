// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves the preserved Universal Chat outbox primitives without changing live transport ownership.
 * @description The Awtsmoos holds one intention before retry, tab, voice, and queue divide; Awtsmoos.com tests each finite vessel in place,
 * so future offline delivery may grow from durable truth while today's realtime sender keeps its existing face.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingOutboxDatabase } from "./MessagingOutboxDatabase.js";
import {
	createTextOutboxIntent,
	createVoiceOutboxIntent
} from "./MessagingOutboxIntent.js";
import { MessagingOutboxLease } from "./MessagingOutboxLease.js";
import { MessagingOutboxRepository } from "./MessagingOutboxRepository.js";
import {
	isRetryableOutboxError,
	outboxRetryDelay,
	serializeOutboxError
} from "./MessagingOutboxRetry.js";
import { MessagingOutboxTestStore } from "./MessagingOutboxTestStore.mjs";

test("outbox database refuses to fake durability without IndexedDB", async () => {
	const database = new MessagingOutboxDatabase({ indexedDB: null });
	await assert.rejects(database.open(), /IndexedDB is unavailable/);
});

test("text and voice intentions preserve one caller-owned identity", () => {
	const common = {
		aliasId: "moshe",
		clientIntentId: "chat-fixed",
		conversationId: "conv-1",
		reply: { replyTo: "message-1", replySequence: 7 }
	};
	const text = createTextOutboxIntent({ ...common, text: "Shalom" }, 100);
	const voiceFile = { name: "voice.webm", size: 12 };
	const voice = createVoiceOutboxIntent({ ...common, file: voiceFile }, 200);
	assert.equal(text.id, "chat-fixed");
	assert.equal(text.text, "Shalom");
	assert.deepEqual(text.reply, { replyTo: "message-1", replySequence: 7 });
	assert.equal(voice.file, voiceFile);
	assert.equal(voice.kind, "voice");
});

test("repository returns due intentions oldest-first and preserves mutations", async () => {
	const repository = new MessagingOutboxRepository(new MessagingOutboxTestStore());
	await repository.put(intent("later", 20, 0));
	await repository.put(intent("future", 5, 500));
	await repository.put(intent("earlier", 10, 0));
	assert.deepEqual((await repository.listDue(100)).map((row) => row.id), ["earlier", "later"]);
	const updated = await repository.update("earlier", { state: "terminal" });
	assert.equal(updated.state, "terminal");
	await repository.remove("later");
	assert.deepEqual((await repository.listAll()).map((row) => row.id).sort(), ["earlier", "future"]);
});

test("lease grants one tab until expiry and protects successor ownership", async () => {
	const database = new MessagingOutboxTestStore();
	let now = 1000;
	const first = new MessagingOutboxLease(database, { ownerId: "first", clock: () => now, ttlMs: 100 });
	const second = new MessagingOutboxLease(database, { ownerId: "second", clock: () => now, ttlMs: 100 });
	assert.equal((await first.acquire()).acquired, true);
	assert.equal((await second.acquire()).acquired, false);
	now = 1200;
	assert.equal((await second.acquire()).acquired, true);
	assert.equal(await first.release(), false);
	assert.equal(await second.release(), true);
});

test("retry policy distinguishes transport wounds from terminal refusal", () => {
	assert.equal(isRetryableOutboxError({ code: "REALTIME_REQUEST_TIMEOUT" }), true);
	assert.equal(isRetryableOutboxError({ status: 503 }), true);
	assert.equal(isRetryableOutboxError({ status: 400 }), false);
	assert.equal(outboxRetryDelay(1, () => 0.5), 1500);
	assert.equal(outboxRetryDelay(2, () => 0.5), 3000);
	assert.deepEqual(serializeOutboxError({ code: "NOPE", message: "failed", status: 429 }), {
		code: "NOPE",
		message: "failed",
		status: 429
	});
});

function intent(id, createdAt, nextAttemptAt) {
	return {
		id,
		createdAt,
		nextAttemptAt,
		state: "queued"
	};
}
