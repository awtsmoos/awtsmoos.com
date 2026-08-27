// B"H
import assert from "node:assert/strict";
import test from "node:test";
import { ConversationRequestObserver } from "../relay/direct/chatgpt/ConversationRequestObserver.mjs";

const REQUEST = {
	requestId: "request-1",
	request: {
		method: "POST",
		url: "https://chatgpt.com/backend-api/f/conversation",
		postData: JSON.stringify({
			messages: [{ id: "user-message-1" }],
			parent_message_id: "parent-1",
			conversation_id: "conversation-1"
		})
	}
};

function fakeClient() {
	let listener = null;
	let removed = 0;
	return {
		async send(method) {
			assert.equal(method, "Network.enable");
			return {};
		},
		on(method, callback) {
			assert.equal(method, "Network.requestWillBeSent");
			listener = callback;
			return () => {
				removed += 1;
				listener = null;
			};
		},
		emit(event = REQUEST) {
			listener?.(event);
		},
		removed() {
			return removed;
		}
	};
}

test("observer timeout starts after a slow composer trigger finishes", async () => {
	const client = fakeClient();
	const observer = new ConversationRequestObserver(client, { timeoutMs: 5 });
	const startedAt = Date.now();
	await assert.rejects(
		observer.observe(() => new Promise(resolve => setTimeout(resolve, 30))),
		/Timed out observing the ChatGPT conversation request/
	);
	assert.ok(Date.now() - startedAt >= 25);
	assert.equal(client.removed(), 1);
});

test("slow composer discovery may exceed observer timeout before one real POST", async () => {
	const client = fakeClient();
	const observer = new ConversationRequestObserver(client, { timeoutMs: 5 });
	const result = await observer.observe(async () => {
		await new Promise(resolve => setTimeout(resolve, 15));
		client.emit();
		await new Promise(resolve => setTimeout(resolve, 15));
	});
	assert.equal(result.userMessageId, "user-message-1");
	assert.equal(result.conversationId, "conversation-1");
	assert.equal(client.removed(), 1);
});

test("an observed POST wins over a later uncertain Send acknowledgement", async () => {
	const client = fakeClient();
	const observer = new ConversationRequestObserver(client, { timeoutMs: 5 });
	const result = await observer.observe(async () => {
		client.emit();
		throw new Error("CDP timeout for Input.dispatchKeyEvent.");
	});
	assert.equal(result.userMessageId, "user-message-1");
	assert.equal(client.removed(), 1);
});

test("a trigger failure before any POST is not hidden or retried", async () => {
	const client = fakeClient();
	const observer = new ConversationRequestObserver(client, { timeoutMs: 5 });
	await assert.rejects(
		observer.observe(async () => {
			throw new Error("composer unavailable");
		}),
		/composer unavailable/
	);
	assert.equal(client.removed(), 1);
});

test("observer claims only the first matching website POST", async () => {
	const client = fakeClient();
	const observer = new ConversationRequestObserver(client, { timeoutMs: 5 });
	const result = await observer.observe(async () => {
		client.emit();
		client.emit({
			...REQUEST,
			requestId: "request-2",
			request: {
				...REQUEST.request,
				postData: JSON.stringify({
					messages: [{ id: "wrong-second-message" }]
				})
			}
		});
	});
	assert.equal(result.userMessageId, "user-message-1");
});
