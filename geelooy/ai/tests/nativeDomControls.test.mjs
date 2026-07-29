//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierControlGate } from "../relay/direct/browser/CarrierControlGate.mjs";
import { CarrierNodeFinder } from "../relay/direct/browser/CarrierNodeFinder.mjs";

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
