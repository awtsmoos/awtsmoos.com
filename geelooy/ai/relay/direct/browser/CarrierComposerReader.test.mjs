// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierComposerReader } from "./CarrierComposerReader.mjs";

test("live selector text bypasses stale native node IDs", async () => {
	const cdpCalls = [];
	const cdpClient = {
		async send(method) {
			cdpCalls.push(method);
			throw new Error("stale native node");
		}
	};
	const selectorReader = {
		async text(selector) {
			assert.equal(selector, "textarea#prompt-textarea");
			return { found: true, text: "B\"H living prompt" };
		}
	};
	const reader = new CarrierComposerReader(cdpClient, { selectorReader });
	const text = await reader.text({
		nodeId: 7,
		selector: "textarea#prompt-textarea"
	});
	assert.equal(text, "B\"H living prompt");
	assert.deepEqual(cdpCalls, []);
});

test("renewed native locator preserves its selector", async () => {
	const cdpClient = {
		async send(method) {
			if (method === "DOM.getDocument") return { root: { nodeId: 1 } };
			if (method === "DOM.querySelector") return { nodeId: 9 };
			throw new Error(`Unexpected method: ${method}`);
		}
	};
	const reader = new CarrierComposerReader(cdpClient, {
		selectorReader: { text: async () => ({ found: false, text: "" }) }
	});
	const locator = await reader.currentLocator({
		nodeId: 7,
		selector: "textarea#prompt-textarea"
	});
	assert.deepEqual(locator, {
		nodeId: 9,
		selector: "textarea#prompt-textarea"
	});
});
