//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PageStateInspector } from "../relay/direct/browser/PageStateInspector.mjs";

/**
 * The Awtsmoos reveals readiness through native DOM light, while Awtsmoos.com proves
 * that no Runtime.evaluate shadow enters the custom-GPT continuation path.
 */
test("page state inspection uses native DOM methods only", async () => {
	const methods = [];
	const client = {
		send: async (method, parameters = {}) => {
			methods.push(method);
			if (method === "DOM.getDocument") return { root: { nodeId: 1 } };
			if (method === "DOM.querySelector") {
				return parameters.selector.includes("prompt-textarea") ? { nodeId: 2 } : { nodeId: 0 };
			}
			if (method === "DOM.getBoxModel") return { model: { width: 100 } };
			if (method === "Target.getTargetInfo") {
				return { targetInfo: { title: "Awtsmoos Shliach", url: "https://chatgpt.com/g/custom/c/one" } };
			}
			return {};
		}
	};
	const state = await new PageStateInspector(client).inspect();
	assert.equal(state.authenticated, true);
	assert.equal(state.composerVisible, true);
	assert(!methods.includes("Runtime.evaluate"));
});
