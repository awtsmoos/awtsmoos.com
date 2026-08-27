// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationDomPoller } from "../relay/direct/chatgpt/ConversationDomPoller.mjs";

const customUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

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
	assert(calls.some(call => call.method === "Page.navigate"
		&& call.params.url === `${customUrl}/c/conversation-1`));
	assert(!calls.some(call => call.method === "Runtime.evaluate"));
});

test("document replacement during navigation is retried without another GET navigation", async () => {
	let documents = 0;
	let navigations = 0;
	const client = {
		async send(method, params = {}) {
			if (method === "Target.getTargetInfo") return { targetInfo: { url: "https://chatgpt.com/" } };
			if (method === "Page.navigate") { navigations += 1; return {}; }
			if (method === "DOM.getDocument") {
				documents += 1;
				if (documents === 1) throw new Error("Could not find node with given id");
				return { root: { nodeId: 1 } };
			}
			if (method === "DOM.querySelectorAll") {
				return params.selector.includes('"user"') ? { nodeIds: [10] } : { nodeIds: [20] };
			}
			if (method === "DOM.getAttributes") {
				return { attributes: ["data-message-id", params.nodeId === 10 ? "rewritten-user" : "assistant-2"] };
			}
			if (method === "DOM.querySelector" && params.selector.includes("stop-button")) return { nodeId: 0 };
			if (method === "DOM.querySelector") return { nodeId: 21 };
			if (method === "DOM.getOuterHTML") return { outerHTML: "<div><p data-is-last-node>COMPLETE</p></div>" };
			return {};
		}
	};
	const result = await new ConversationDomPoller(client, {
		intervalMs: 1,
		sleep: async () => undefined
	}).poll({
		conversationId: "conversation-2",
		userMessageId: "original-user",
		timeoutMs: 5000
	});
	assert.equal(result.answer, "COMPLETE");
	assert.equal(result.userMessageObserved, false);
	assert.equal(navigations, 1);
	assert.equal(documents, 2);
});
