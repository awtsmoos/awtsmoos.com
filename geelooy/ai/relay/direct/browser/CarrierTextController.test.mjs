// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierTextController } from "./CarrierTextController.mjs";

function cdpFixture(liveValue) {
	const calls = [];
	const cdpClient = {
		async send(method, params) {
			calls.push({ method, params });
			if (method === "Input.insertText") return {};
			if (method === "DOM.resolveNode") {
				return { object: { objectId: "composer-object" } };
			}
			if (method === "Runtime.callFunctionOn") {
				return { result: { value: liveValue } };
			}
			if (method === "Runtime.releaseObject") return {};
			throw new Error(`Unexpected CDP method: ${method}`);
		}
	};
	return { calls, cdpClient };
}

test("live textarea value verifies fast insertion without character fallback", async () => {
	const prompt = "B\"H exact private prompt";
	const fixture = cdpFixture(prompt);
	const controller = new CarrierTextController(fixture.cdpClient, {
		sleep: async () => {}
	});
	let fallbackPrepared = false;
	await controller.replace({ nodeId: 7 }, prompt, {
		prepareCharacterFallback: async () => {
			fallbackPrepared = true;
		}
	});
	assert.equal(fallbackPrepared, false);
	assert.equal(
		fixture.calls.filter((call) => call.method === "Input.dispatchKeyEvent").length,
		0
	);
	assert.equal(
		fixture.calls.filter((call) => call.method === "Input.insertText").length,
		1
	);
	assert.equal(
		fixture.calls.filter((call) => call.method === "Runtime.callFunctionOn").length,
		1
	);
});

test("mismatched live value uses bounded character fallback", async () => {
	const values = ["", "", "", "", "OK"];
	const calls = [];
	const reader = {
		normalize: value => String(value),
		currentLocator: async () => ({ nodeId: 9 }),
		text: async () => values.shift() ?? "OK"
	};
	const cdpClient = {
		async send(method, params) {
			calls.push({ method, params });
			return {};
		}
	};
	const controller = new CarrierTextController(cdpClient, {
		reader,
		sleep: async () => {}
	});
	let fallbackLocator = null;
	await controller.replace({ nodeId: 7 }, "OK", {
		prepareCharacterFallback: async locator => {
			fallbackLocator = locator;
		}
	});
	assert.deepEqual(fallbackLocator, { nodeId: 9 });
	assert.equal(
		calls.filter((call) => call.method === "Input.dispatchKeyEvent").length,
		2
	);
});
