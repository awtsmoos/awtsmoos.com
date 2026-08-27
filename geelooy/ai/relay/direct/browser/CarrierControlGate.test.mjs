// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierControlGate, SEND_SELECTORS } from "./CarrierControlGate.mjs";

function fixture(attributes = []) {
	const selectorCalls = [];
	const nodeFinder = {
		async findOnce(selectors) {
			selectorCalls.push([...selectors]);
			if (selectorCalls.length === 1) {
				return { nodeId: 1, selector: selectors[0] };
			}
			return { nodeId: 2, selector: "button#composer-submit-button" };
		}
	};
	const cdpClient = {
		async send(method, params) {
			assert.equal(method, "DOM.getAttributes");
			assert.deepEqual(params, { nodeId: 2 });
			return { attributes };
		}
	};
	return {
		gate: new CarrierControlGate(cdpClient, {
			nodeFinder,
			sleep: async () => {},
			timeoutMs: 100
		}),
		selectorCalls
	};
}

test("renewed composer submit button is supported", () => {
	assert(SEND_SELECTORS.includes("button#composer-submit-button"));
	assert(SEND_SELECTORS.includes("form button[type='submit']"));
});

test("enabled renewed submit button becomes ready", async () => {
	const state = fixture();
	const result = await state.gate.inspect();
	assert.deepEqual(result, {
		ready: true,
		sendSelector: "button#composer-submit-button",
		reason: "ready"
	});
	assert(state.selectorCalls[1].includes("button#composer-submit-button"));
});

test("disabled renewed submit button remains blocked", async () => {
	const state = fixture(["disabled", ""]);
	const result = await state.gate.inspect();
	assert.deepEqual(result, {
		ready: false,
		sendSelector: null,
		reason: "send_disabled"
	});
});
