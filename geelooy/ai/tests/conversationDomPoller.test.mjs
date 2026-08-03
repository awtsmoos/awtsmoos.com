// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationDomPoller } from "../relay/direct/chatgpt/ConversationDomPoller.mjs";

test("authenticated route GET yields exact native-DOM continuation state", async () => {
	const calls = [];
	const client = {
		async send(method, params = {}) {
			calls.push({ method, params });
			if (method === "Target.getTargetInfo") return { targetInfo: { url: "https://chatgpt.com/" } };
			if (method === "Page.navigate") return {};
			if (method === "DOM.getDocument") return { root: { nodeId: 1 } };
			if (method === "DOM.querySelectorAll") {
				return params.selector.includes('"user"') ? { nodeIds: [10] } : { nodeIds: [20] };
			}
			if (method === "DOM.getAttributes") {
				return { attributes: ["data-message-id", params.nodeId === 10 ? "user-1" : "assistant-1"] };
			}
			if (method === "DOM.querySelector" && params.selector.includes("stop-button")) return { nodeId: 0 };
			if (method === "DOM.querySelector") return { nodeId: 21 };
			if (method === "DOM.getOuterHTML") {
				return { outerHTML: '<div data-message-id="assistant-1"><p data-is-last-node>BH COMPLETE &amp; SAFE</p></div>' };
			}
			return {};
		}
	};
	const result = await new ConversationDomPoller(client).poll({
		conversationId: "conversation-1",
		userMessageId: "user-1",
		timeoutMs: 5000
	});
	assert.equal(result.done, true);
	assert.equal(result.answer, "BH COMPLETE & SAFE");
	assert.equal(result.parentMessageId, "assistant-1");
	assert(calls.some(call => call.method === "Page.navigate"));
	assert(!calls.some(call => call.method === "Runtime.evaluate"));
});
