//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierControlGate } from "../relay/direct/browser/CarrierControlGate.mjs";
import { CarrierNodeFinder } from "../relay/direct/browser/CarrierNodeFinder.mjs";
import { WebsitePromptInteractor } from "../relay/direct/browser/WebsitePromptInteractor.mjs";

/** Native node discovery queries the DOM domain and verifies a visible box. */
test("native node finder avoids page-context evaluation", async () => {
	const calls = [];
	const client = {
		async send(method, params) {
			calls.push([method, params]);
			if (method === "DOM.getDocument") return { root: { nodeId: 1 } };
			if (method === "DOM.querySelector") {
				return { nodeId: params.selector === "#found" ? 9 : 0 };
			}
			if (method === "DOM.getBoxModel") {
				return { model: { content: [0, 0, 10, 0, 10, 10, 0, 10] } };
			}
			return {};
		}
	};
	const result = await new CarrierNodeFinder(client).findOnce(["#missing", "#found"]);
	assert.deepEqual(result, { nodeId: 9, selector: "#found" });
	assert.equal(calls.some(([method]) => method === "Runtime.evaluate"), false);
});

/** Readiness requires an enabled Send node and does not read composer text. */
test("native control gate reads only nodes and attributes", async () => {
	let finderCall = 0;
	const gate = new CarrierControlGate({
		async send(method) {
			assert.equal(method, "DOM.getAttributes");
			return { attributes: ["data-testid", "send-button"] };
		}
	}, {
		nodeFinder: {
			async findOnce() {
				finderCall += 1;
				return finderCall === 1
					? { nodeId: 4, selector: "#composer" }
					: { nodeId: 5, selector: "button[data-testid='send-button']" };
			}
		}
	});
	assert.deepEqual(await gate.inspect(), {
		ready: true,
		sendSelector: "button[data-testid='send-button']",
		reason: "ready"
	});
});

test("native control gate survives a replaced Send node", async () => {
	let attributeReads = 0;
	const gate = new CarrierControlGate({
		async send(method) {
			assert.equal(method, "DOM.getAttributes");
			attributeReads += 1;
			if (attributeReads === 1) throw new Error("Could not find node with given id");
			return { attributes: ["data-testid", "send-button"] };
		}
	}, {
		timeoutMs: 100,
		intervalMs: 1,
		sleep: async () => undefined,
		nodeFinder: {
			async findOnce(selectors) {
				return { nodeId: selectors.some(value => value.includes("button")) ? 5 : 4,
					selector: selectors[0] };
			}
		}
	});
	assert.equal((await gate.waitUntilReady()).ready, true);
	assert.equal(attributeReads, 2);
});

test("website prompt uses the visible composer and ordinary Send button", async () => {
	const calls = [];
	const interactor = new WebsitePromptInteractor({}, {
		nodeFinder: {
			async findFirst(selectors) {
				calls.push(["find", selectors]);
				return calls.filter(([kind]) => kind === "find").length === 1
					? { nodeId: 7, selector: "#prompt-textarea" }
					: { nodeId: 9, selector: "button[data-testid='send-button']" };
			}
		},
		inputController: {
			async focusAndReplace(locator, text) {
				calls.push(["replace", locator, text]);
			},
			async activateNode(locator) {
				calls.push(["activate", locator]);
			}
		},
		controlGate: {
			async waitUntilReady() {
				calls.push(["ready"]);
				return { sendSelector: "button[data-testid='send-button']" };
			}
		}
	});
	const result = await interactor.submit("B\"H exact prompt");
	assert.equal(result.submissionGesture, "send-button-keyboard");
	assert.deepEqual(calls.map(([kind]) => kind), [
		"find", "replace", "ready", "find", "activate"
	]);
});
