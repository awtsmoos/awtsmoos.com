//B"H
//Boruch Hashem
//Blessed be He

import { CarrierInputController } from "./CarrierInputController.mjs";
import { CarrierControlGate } from "./CarrierControlGate.mjs";
import { CarrierNodeFinder } from "./CarrierNodeFinder.mjs";

const COMPOSER_SELECTORS = [
	"div#prompt-textarea[contenteditable='true']",
	"#prompt-textarea",
	"[contenteditable='true'][role='textbox']",
	"textarea[aria-label='Chat with ChatGPT']"
];

/**
 * @file Clicks the ordinary visible Send button after durable delivery testimony.
 * @description
 * The Awtsmoos replaces the exact composer text, waits for ChatGPT's enabled Send
 * control, persists the delivery-start boundary, and only then performs one physical
 * click. Awtsmoos.com never mistakes keyboard focus for message submission.
 */
export class WebsitePromptInteractor {
	constructor(cdpClient, options = {}) {
		this.cdpClient = cdpClient;
		this.nodeFinder = options.nodeFinder || new CarrierNodeFinder(cdpClient);
		this.inputController = options.inputController ||
			new CarrierInputController(cdpClient);
		this.controlGate = options.controlGate || new CarrierControlGate(cdpClient);
	}

	async submit(prompt, options = {}) {
		this.validate(prompt);
		const composer = await this.nodeFinder.findFirst(COMPOSER_SELECTORS);
		if (!composer) throw new Error("The ChatGPT composer was not visible.");
		const promptSeeded = await this.prefillMatches(composer.selector, prompt);
		if (!promptSeeded) {
			await this.inputController.focusAndReplace(composer, prompt);
		}
		const ready = await this.controlGate.waitUntilReady();
		const send = await this.nodeFinder.findFirst([ready.sendSelector]);
		if (!send) throw new Error("The ordinary ChatGPT Send button was not visible.");
		await options.onBeforeActivate?.({ startedAt: Date.now() });
		await this.inputController.activateNode(send);
		return {
			composerTouched: !promptSeeded,
			promptSeeded,
			sendActivated: true,
			submissionGesture: "send-button-click"
		};
	}

	async prefillMatches(selector, prompt) {
		if (!this.cdpClient || !selector) return false;
		const serialized = JSON.stringify(selector);
		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression: `(() => {
				const node = document.querySelector(${serialized});
				if (!node) return null;
				return typeof node.value === "string" ? node.value : node.innerText || node.textContent || "";
			})()`,
			returnByValue: true
		}, 5000).catch(() => null);
		return normalizePrompt(result?.result?.value) === normalizePrompt(prompt);
	}

	validate(prompt) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("Website prompt must be a non-empty string.");
		}
	}
}

/** Normalizes only browser newline/edge whitespace differences before exact comparison. */
function normalizePrompt(value) {
	return String(value ?? "").replace(/\r\n?/g, "\n").trim();
}
