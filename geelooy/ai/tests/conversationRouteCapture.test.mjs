// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationRouteCapture } from "../relay/direct/chatgpt/ConversationRouteCapture.mjs";

const customUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

test("conversation capture reuses a root ChatGPT tab for GET-only recovery", async () => {
	const calls = [];
	class FakeCdpClient {
		constructor(url) { this.url = url; this.listeners = new Map(); }
		async connect() {}
		on(method, listener) { this.listeners.set(method, listener); return () => this.listeners.delete(method); }
		async send(method, params = {}) {
			calls.push({ method, params });
			if (method === "Page.navigate") {
				queueMicrotask(() => this.listeners.get("Fetch.requestPaused")?.({
					requestId: "get-1",
					responseStatusCode: 200,
					request: { url: "https://chatgpt.com/backend-api/conversation/conversation-id" }
				}));
			}
			if (method === "Fetch.getResponseBody") {
				return { body: JSON.stringify({ current_node: "assistant-node" }), base64Encoded: false };
			}
			return {};
		}
		close() {}
	}
	const fetcher = async () => response([{
		type: "page",
		url: "https://chatgpt.com/",
		webSocketDebuggerUrl: "ws://existing-target"
	}]);
	const capture = new ConversationRouteCapture({
		port: 9223,
		fetcher,
		CdpClientClass: FakeCdpClient
	});
	const result = await capture.capture({ conversationId: "conversation-id", timeoutMs: 1000 });
	assert.equal(result.document.current_node, "assistant-node");
	assert(calls.some(call => call.method === "Page.navigate"
		&& call.params.url === `${customUrl}/c/conversation-id`));
	assert(!calls.some(call => call.method === "Page.reload"));
});

test("conversation capture reloads an already matching conversation tab", async () => {
	let reloaded = false;
	class FakeCdpClient {
		constructor() { this.listener = null; }
		async connect() {}
		on(_method, listener) { this.listener = listener; return () => {}; }
		async send(method) {
			if (method === "Page.reload") {
				reloaded = true;
				queueMicrotask(() => this.listener({
					requestId: "get-2",
					responseStatusCode: 200,
					request: { url: "https://chatgpt.com/backend-api/conversation/conversation-id" }
				}));
			}
			if (method === "Fetch.getResponseBody") return { body: "{}", base64Encoded: false };
			return {};
		}
		close() {}
	}
	const capture = new ConversationRouteCapture({
		port: 9223,
		fetcher: async () => response([{
			type: "page",
			url: `${customUrl}/c/conversation-id`,
			webSocketDebuggerUrl: "ws://matching-target"
		}]),
		CdpClientClass: FakeCdpClient
	});
	await capture.capture({ conversationId: "conversation-id", timeoutMs: 1000 });
	assert.equal(reloaded, true);
});

function response(document) {
	return { ok: true, status: 200, json: async () => document };
}
