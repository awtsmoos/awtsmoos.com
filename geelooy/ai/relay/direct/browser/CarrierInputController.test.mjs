// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierInputController } from "./CarrierInputController.mjs";

test("text verification preserves the original selector after React renewal", async () => {
	const original = {
		nodeId: 7,
		selector: "textarea[aria-label='Chat with ChatGPT']"
	};
	const renewed = {
		nodeId: 9,
		selector: original.selector
	};
	const calls = [];
	const textController = {
		async replace(locator, text, options) {
			calls.push({ stage: "replace", locator, text });
			assert.equal(typeof options.prepareCharacterFallback, "function");
		},
		async currentLocator(locator) {
			calls.push({ stage: "current", locator });
			return renewed;
		}
	};
	const pointerController = {
		async focusComposer(locator) {
			calls.push({ stage: "focus", locator });
			return { nodeId: 9 };
		}
	};
	const keyboardController = {
		async selectAll() {
			calls.push({ stage: "select" });
		},
		async pressKey(event) {
			calls.push({ stage: "key", event });
		}
	};
	const controller = new CarrierInputController({}, {
		textController,
		pointerController,
		keyboardController,
		sleep: async () => {}
	});
	const result = await controller.focusAndReplace(original, "B\"H exact prompt");
	assert.deepEqual(result, renewed);
	const replace = calls.find(call => call.stage === "replace");
	assert.deepEqual(replace.locator, original);
	assert.equal(replace.text, "B\"H exact prompt");
	assert.equal(
		calls.filter(call => call.stage === "focus").length,
		1
	);
});
