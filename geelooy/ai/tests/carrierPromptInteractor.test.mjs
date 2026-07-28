//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierPromptInteractor } from "../relay/direct/browser/CarrierPromptInteractor.mjs";

/** One recognized carrier state clicks exactly one enabled native send control. */
test("carrier prompt waits for readiness and clicks once", async () => {
	const composer = { backendNodeId: 41 };
	const send = { backendNodeId: 52 };
	const events = [];
	const interactor = new CarrierPromptInteractor(null, {
		nodeFinder: {
			async findFirst(selectors) {
				events.push(["find", selectors]);
				return events.filter(event => event[0] === "find").length === 1
					? composer
					: send;
			}
		},
		inputController: {
			async focusAndReplace(locator, text) {
				events.push(["replace", locator, text]);
			},
			async clickNode(locator) {
				events.push(["click", locator]);
			}
		},
		controlGate: {
			async waitUntilReady() {
				events.push(["ready"]);
				return {
					ready: true,
					sendSelector: "button[data-testid='send-button']"
				};
			}
		}
	});
	await interactor.submit("carrier", 3);
	assert.deepEqual(events, [
		["find", [
			"div#prompt-textarea[contenteditable='true']",
			"textarea#mobile-composer-prompt",
			"textarea[aria-label='Chat with ChatGPT']",
			"[contenteditable='true'][role='textbox']"
		]],
		["replace", composer, "carrier Attempt 3"],
		["ready"],
		["find", ["button[data-testid='send-button']"]],
		["click", send]
	]);
});
