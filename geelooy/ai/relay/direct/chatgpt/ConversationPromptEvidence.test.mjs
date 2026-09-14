//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationPromptEvidence, ConversationPromptEvidenceText } from "./ConversationPromptEvidence.mjs";

/** Proves native DOM prompt evidence survives page-script execution-context churn. */
test("native DOM exact prompt matches normalized visible user text", async () => {
	const calls = [];
	const client = {
		async send(method, params) {
			calls.push(method);
			if (method === "DOM.enable") return {};
			if (method === "DOM.getDocument") return { root: { nodeId: 1 } };
			if (method === "DOM.querySelectorAll") return { nodeIds: [7] };
			if (method === "DOM.getOuterHTML") return {
				outerHTML: '<div data-message-author-role="user"><div>B&amp;H&nbsp; “exact”   prompt</div></div>'
			};
			throw new Error(`unexpected:${method}:${JSON.stringify(params)}`);
		}
	};
	const evidence = new ConversationPromptEvidence(client);
	assert.equal(await evidence.matches("B&H \"exact\" prompt"), true);
	assert.equal(calls.includes("Runtime.evaluate"), false);
});

test("wrong user message does not satisfy saved prompt evidence", async () => {
	const client = {
		async send(method) {
			if (method === "DOM.enable") return {};
			if (method === "DOM.getDocument") return { root: { nodeId: 1 } };
			if (method === "DOM.querySelectorAll") return { nodeIds: [8] };
			if (method === "DOM.getOuterHTML") return { outerHTML: "<div>different prompt</div>" };
			throw new Error(`unexpected:${method}`);
		}
	};
	assert.equal(await new ConversationPromptEvidence(client).matches("wanted prompt"), false);
});

test("transient DOM churn returns false while hard protocol failures surface", async () => {
	const transient = { send: async method => {
		if (method === "DOM.enable") return {};
		throw new Error("Node with given id does not belong to the document");
	} };
	assert.equal(await new ConversationPromptEvidence(transient).matches("prompt"), false);
	const hard = { send: async method => {
		if (method === "DOM.enable") return {};
		throw new Error("protocol authorization denied");
	} };
	await assert.rejects(() => new ConversationPromptEvidence(hard).matches("prompt"), /authorization denied/);
});

test("text normalization decodes entities and collapses visible whitespace", () => {
	const { normalize, visibleText } = ConversationPromptEvidenceText;
	assert.equal(normalize(visibleText("<div>A&amp;B<br>  C</div>")), "A&B C");
});
