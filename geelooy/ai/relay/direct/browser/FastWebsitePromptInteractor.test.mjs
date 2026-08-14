// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { FastWebsitePromptInteractor } from "./FastWebsitePromptInteractor.mjs";

test("fast interactor inserts once and clicks Send without rereading text", async () => {
	const calls = [];
	let sendChecks = 0;
	const cdpClient = {
		async send(method, params) {
			calls.push({ method, params });
			if (method === "Runtime.evaluate") {
				if (String(params.expression).includes("document.activeElement")) {
					return { result: { value: true } };
				}
				sendChecks += 1;
				return { result: { value: sendChecks >= 2 } };
			}
			return {};
		}
	};
	const interactor = new FastWebsitePromptInteractor(cdpClient, {
		sleep: async () => {},
		readyTimeoutMs: 100
	});
	const result = await interactor.submit("B\"H concise launch");
	assert.equal(result.sendActivated, true);
	const inserts = calls.filter(call => call.method === "Input.insertText");
	assert.equal(inserts.length, 1);
	assert.equal(inserts[0].params.text, "B\"H concise launch");
	assert.equal(
		calls.filter(call => call.method === "DOM.resolveNode").length,
		0
	);
	assert.equal(sendChecks, 2);
});

test("fast interactor rejects when no composer exists", async () => {
	const cdpClient = {
		async send(method) {
			assert.equal(method, "Runtime.evaluate");
			return { result: { value: false } };
		}
	};
	const interactor = new FastWebsitePromptInteractor(cdpClient);
	await assert.rejects(
		() => interactor.submit("B\"H concise launch"),
		error => error.message === "The fleeting GPT composer was not visible."
	);
});
