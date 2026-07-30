//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationRouteCapture } from "../relay/direct/chatgpt/ConversationRouteCapture.mjs";

class FakeCdpClient {
	async connect() {}
	async send(method) {
		assert.equal(method, "Network.getCookies");
		return { cookies: [{ name: "session", value: "private" }] };
	}
	close() {}
}

test("conversation capture uses one authenticated GET without creating a tab", async () => {
	const requests = [];
	const fetcher = async (url, options = {}) => {
		requests.push({ url, options });
		if (url.includes("/json/list")) {
			return response([{ type: "page", url: "https://chatgpt.com/", webSocketDebuggerUrl: "ws://target" }]);
		}
		assert.match(options.headers.cookie, /session=private/);
		return response({ current_node: "assistant-node" });
	};
	const capture = new ConversationRouteCapture({ port: 9223, fetcher, CdpClientClass: FakeCdpClient });
	const result = await capture.capture({ conversationId: "conversation-id" });
	assert.equal(result.document.current_node, "assistant-node");
	assert.equal(requests.length, 2);
	assert(!requests.some(entry => entry.url.includes("/json/new")));
});

function response(document) {
	return { ok: true, status: 200, json: async () => document };
}
