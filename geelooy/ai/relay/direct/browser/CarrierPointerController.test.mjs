// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierPointerController } from "./CarrierPointerController.mjs";

function fixture({ geometryFails = true, domActivates = true } = {}) {
	const calls = [];
	const cdpClient = {
		async send(method, params) {
			calls.push({ method, params });
			if (method === "DOM.getBoxModel") {
				if (geometryFails) throw new Error("Could not compute box model.");
				return {
					model: { border: [0, 0, 10, 0, 10, 10, 0, 10] }
				};
			}
			if (method === "Input.dispatchMouseEvent") return {};
			throw new Error(`Unexpected method: ${method}`);
		}
	};
	const domActivator = {
		currentLocator: async locator => locator,
		activate: async () => domActivates,
		nativeLocator: locator => locator,
		transient: error => /box model/i.test(String(error?.message || error))
	};
	const controller = new CarrierPointerController(cdpClient, null, {
		domActivator,
		sleep: async () => {}
	});
	return { calls, controller };
}

test("box-model failure falls back to living DOM activation", async () => {
	const state = fixture();
	const locator = { nodeId: 7 };
	const result = await state.controller.clickVisibleCenterRenewed(locator);
	assert.deepEqual(result, locator);
	assert.equal(
		state.calls.filter(call => call.method === "DOM.getBoxModel").length,
		1
	);
	assert.equal(
		state.calls.filter(call => call.method === "Input.dispatchMouseEvent").length,
		0
	);
});

test("visible geometry dispatches one complete mouse click", async () => {
	const state = fixture({ geometryFails: false, domActivates: false });
	const locator = { nodeId: 9 };
	const result = await state.controller.clickVisibleCenterRenewed(locator);
	assert.deepEqual(result, locator);
	const mouseCalls = state.calls.filter(call => {
		return call.method === "Input.dispatchMouseEvent";
	});
	assert.equal(mouseCalls.length, 2);
	assert.deepEqual(mouseCalls.map(call => call.params.type), [
		"mousePressed",
		"mouseReleased"
	]);
	assert(mouseCalls.every(call => call.params.x === 5 && call.params.y === 5));
});
