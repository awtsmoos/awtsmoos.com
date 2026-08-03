// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationRequestObserver } from "./ConversationRequestObserver.mjs";

function clientFixture() {
	const listeners = new Map();
	return {
		on(name, handler) {
			listeners.set(name, handler);
			return () => listeners.delete(name);
		},
		async send(method) {
			if (method === "Network.enable") return {};
			throw new Error(`unexpected_${method}`);
		},
		emit(name, value) { listeners.get(name)?.(value); },
		listenerCount() { return listeners.size; }
	};
}

function requestEvent() {
	return {
		requestId: "request-one",
		request: {
			method: "POST",
			url: "https://chatgpt.com/backend-api/f/conversation",
			headers: { Authorization: "private" },
			postData: JSON.stringify({
				conversation_id: "conversation-one",
				parent_message_id: "parent-one",
				messages: [{ id: "user-one" }]
			})
		}
	};
}

test("observer returns only after the matching POST response is accepted", async () => {
	const client = clientFixture();
	const observer = new ConversationRequestObserver(client, { timeoutMs: 5000 });
	const result = await observer.observe(async () => {
		client.emit("Network.requestWillBeSent", requestEvent());
		client.emit("Network.responseReceived", {
			requestId: "request-one",
			response: { status: 200, url: "https://chatgpt.com/backend-api/f/conversation" }
		});
	});
	assert.equal(result.conversationId, "conversation-one");
	assert.equal(result.userMessageId, "user-one");
	assert.equal(result.responseStatus, 200);
	assert.equal(client.listenerCount(), 0);
});

test("late click failure cannot repeat an already observed accepted POST", async () => {
	const client = clientFixture();
	const observer = new ConversationRequestObserver(client, { timeoutMs: 5000 });
	const result = await observer.observe(async () => {
		client.emit("Network.requestWillBeSent", requestEvent());
		client.emit("Network.responseReceived", {
			requestId: "request-one",
			response: { status: 202, url: "https://chatgpt.com/backend-api/f/conversation" }
		});
		throw new Error("late_ui_error");
	});
	assert.equal(result.responseStatus, 202);
});

test("a rejected POST never qualifies for tab closure", async () => {
	const client = clientFixture();
	const observer = new ConversationRequestObserver(client, { timeoutMs: 5000 });
	await assert.rejects(() => observer.observe(async () => {
		client.emit("Network.requestWillBeSent", requestEvent());
		client.emit("Network.responseReceived", {
			requestId: "request-one",
			response: { status: 429, url: "https://chatgpt.com/backend-api/f/conversation" }
		});
	}), error => error.code === "conversation_post_429");
});
