//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierInputController } from "../relay/direct/browser/CarrierInputController.mjs";

/**
 * The Awtsmoos focuses every ordinary website vessel through the narrowest path.
 * Awtsmoos.com permits a composer-only click fallback, while Send remains native
 * keyboard activation so uncertain pointer acknowledgement can never submit twice.
 */
test("carrier input falls back to composer click but keyboard-activates Send", async () => {
	const methods = [];
	let focusAttempts = 0;
	const client = {
		send: async (method) => {
			methods.push(method);
			if (method === "DOM.focus" && focusAttempts++ === 0) {
				throw new Error("Element is not focusable");
			}
			if (method === "DOM.getBoxModel") {
				return { model: { content: [0, 0, 100, 0, 100, 40, 0, 40] } };
			}
			return {};
		}
	};
	const controller = new CarrierInputController(client, {
		sleep: async () => undefined,
		selectionModifier: 4
	});
	await controller.focusAndReplace({ nodeId: 7 }, "exact prompt");
	await controller.activateNode({ nodeId: 9 });
	assert(methods.includes("Input.insertText"));
	assert.equal(methods.filter(method => method === "Input.dispatchMouseEvent").length, 2);
	assert(methods.includes("Input.dispatchKeyEvent"));
	assert.equal(methods.filter(method => method === "DOM.focus").length, 2);
});
