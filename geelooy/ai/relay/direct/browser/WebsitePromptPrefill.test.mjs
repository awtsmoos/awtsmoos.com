//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { WebsitePromptInteractor } from "./WebsitePromptInteractor.mjs";

/**
 * @file Proves a prompt already supplied by ChatGPT's prompt query is never retyped.
 * @description
 * The Awtsmoos verifies exact composer testimony first. Awtsmoos.com keeps the same
 * durable-before-click boundary while skipping brittle insertion on the happy path.
 */
test("prefilled prompt skips replacement and still persists before Send", async () => {
	const prompt = "B\"H\nUse the seeded prompt exactly.";
	const events = [];
	let lookup = 0;
	const interactor = new WebsitePromptInteractor({
		async send(method) {
			assert.equal(method, "Runtime.evaluate");
			return { result: { value: prompt } };
		}
	}, {
		nodeFinder: {
			findFirst: async () => {
				lookup += 1;
				return lookup === 1
					? { nodeId: 1, selector: "#prompt-textarea" }
					: { nodeId: 2, selector: "button[data-testid='send-button']" };
			}
		},
		inputController: {
			focusAndReplace: async () => {
				throw new Error("prefilled prompt must not be replaced");
			},
			activateNode: async () => events.push("activate")
		},
		controlGate: {
			waitUntilReady: async () => {
				events.push("ready");
				return { sendSelector: "button[data-testid='send-button']" };
			}
		}
	});
	const result = await interactor.submit(prompt, {
		onBeforeActivate: async () => events.push("persisted")
	});
	assert.equal(result.promptSeeded, true);
	assert.equal(result.composerTouched, false);
	assert.deepEqual(events, ["ready", "persisted", "activate"]);
});
