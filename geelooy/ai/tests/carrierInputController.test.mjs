//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierInputController } from "../relay/direct/browser/CarrierInputController.mjs";

/** The compact carrier begins with pointer activation before any text enters. */
test("carrier input clicks, clears, inserts, and synchronizes", async () => {
	const calls = [];
	const client = {
		async send(method, params) {
			calls.push([method, params]);
			if (method === "DOM.getBoxModel") {
				return { model: { content: [0, 0, 10, 0, 10, 10, 0, 10] } };
			}
			return {};
		}
	};
	const controller = new CarrierInputController(client, {
		selectionModifier: 4,
		sleep: async () => undefined
	});
	await controller.focusAndReplace({ backendNodeId: 41 }, "carrier");
	assert.deepEqual(calls[0], ["DOM.getBoxModel", { backendNodeId: 41 }]);
	assert.equal(calls[1][0], "Input.dispatchMouseEvent");
	assert.equal(calls[2][0], "Input.dispatchMouseEvent");
	assert.ok(calls.some(([method, params]) => {
		return method === "Input.insertText" && params.text === "carrier";
	}));
	assert.ok(calls.some(([method, params]) => {
		return method === "Input.dispatchKeyEvent"
			&& params.type === "char"
			&& params.code === "Period";
	}));
});
