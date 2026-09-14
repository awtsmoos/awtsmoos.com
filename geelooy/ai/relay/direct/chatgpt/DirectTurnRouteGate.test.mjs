//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectTurnRouteGate } from "./DirectTurnRouteGate.mjs";

const request = {
	acceptedAt: 123456,
	userMessageId: "user-message",
	responseStatus: 200
};
const route = {
	conversationId: "12345678-1234-4234-8234-123456789abc",
	conversationUrl: "https://chatgpt.com/c/12345678-1234-4234-8234-123456789abc"
};

/** Proves the route gate makes POST acceptance non-retriable without pretending a chat exists. */
test("route timeout is decorated as accepted-but-routeless", async () => {
	const failure = Object.assign(new Error("missing route"), {
		code: "chatgpt_saved_conversation_route_missing"
	});
	const gate = new DirectTurnRouteGate({
		routeWaiter: { wait: async () => { throw failure; } }
	});
	await assert.rejects(() => gate.verify({}, {}, request), error => {
		assert.equal(error.code, "chatgpt_saved_conversation_route_missing");
		assert.equal(error.submissionAccepted, true);
		assert.equal(error.acceptedAt, 123456);
		assert.equal(error.userMessageId, "user-message");
		assert.equal(error.conversationId, null);
		return true;
	});
});

test("verified route is persisted with the real upstream UUID", async () => {
	let persisted = null;
	const gate = new DirectTurnRouteGate({ routeWaiter: { wait: async () => route } });
	assert.deepEqual(await gate.verify({}, {}, request), route);
	await gate.persist({ onSubmissionAccepted: async value => { persisted = value; } }, request, route);
	assert.deepEqual(persisted, {
		acceptedAt: 123456,
		conversationId: route.conversationId,
		conversationUrl: route.conversationUrl,
		userMessageId: "user-message",
		responseStatus: 200
	});
});
