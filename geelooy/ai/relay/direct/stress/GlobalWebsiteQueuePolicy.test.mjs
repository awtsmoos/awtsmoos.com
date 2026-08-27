// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	MAX_ACTIVE_WEBSITE_TABS,
	MAX_DURABLE_QUEUE_ITEMS,
	POST_CLOSE_COOLDOWN_MS,
	acceptedReceipt,
	createTicket,
	queueConfiguration
} from "./GlobalWebsiteQueuePolicy.mjs";

/**
 * @file Proves immutable physical limits and stable logical turn identities.
 * @description
 * The Awtsmoos may queue multitudes, but Awtsmoos.com keeps one active tab,
 * eighteen seconds after verified closure, and one deterministic ticket for every
 * stable mission turn even when callers or environments request weaker vessels.
 */
test("physical tab and cooldown limits cannot be weakened", () => {
	const configuration = queueConfiguration({
		maxActiveTabs: 500,
		minimumIntervalMs: 1
	});
	assert.equal(MAX_ACTIVE_WEBSITE_TABS, 1);
	assert.equal(configuration.maxActiveTabs, 1);
	assert.equal(configuration.minimumIntervalMs, POST_CLOSE_COOLDOWN_MS);
});

test("larger safe spacing remains accepted", () => {
	const configuration = queueConfiguration({ minimumIntervalMs: 24000 });
	assert.equal(configuration.minimumIntervalMs, 24000);
});

test("queue capacity accepts large swarms but remains hard bounded", () => {
	assert.equal(queueConfiguration({ maxQueueItems: 100 }).maxQueueItems, 100);
	assert.equal(
		queueConfiguration({ maxQueueItems: Number.MAX_SAFE_INTEGER }).maxQueueItems,
		MAX_DURABLE_QUEUE_ITEMS
	);
});

test("stable idempotency keys create the same durable ticket", () => {
	const first = createTicket({ idempotencyKey: "mission:agent:round:1" }, 10);
	const second = createTicket({ idempotencyKey: "mission:agent:round:1" }, 20);
	assert.equal(first.id, second.id);
	assert.equal(first.idempotencyKey, second.idempotencyKey);
	assert.notEqual(first.createdAt, second.createdAt);
});

test("accepted receipts keep nullable fields null", () => {
	assert.deepEqual(acceptedReceipt({ acceptedAt: 55 }, 10), {
		acceptedAt: 55,
		conversationId: "",
		userMessageId: "",
		responseStatus: null,
		closedAt: null
	});
});
