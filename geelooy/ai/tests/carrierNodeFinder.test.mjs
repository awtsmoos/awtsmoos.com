//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierNodeFinder } from "../relay/direct/browser/CarrierNodeFinder.mjs";

test("carrier finder retries a transient DOM query timeout", async () => {
	let queryAttempts = 0;
	const client = {
		send: async method => {
			if (method === "DOM.getDocument") return { root: { nodeId: 1 } };
			if (method === "DOM.querySelector") {
				queryAttempts += 1;
				if (queryAttempts === 1) throw new Error("CDP timeout for DOM.querySelector.");
				return { nodeId: 7 };
			}
			if (method === "DOM.getBoxModel") {
				return { model: { content: [0, 0, 1, 0, 1, 1, 0, 1] } };
			}
			throw new Error(`Unexpected method: ${method}`);
		}
	};
	const finder = new CarrierNodeFinder(client, {
		timeoutMs: 100,
		intervalMs: 1,
		sleep: async () => undefined
	});
	const result = await finder.findFirst(["#prompt-textarea"]);
	assert.equal(result.nodeId, 7);
	assert.equal(queryAttempts, 2);
});
