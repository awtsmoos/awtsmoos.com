// B"H
// Boruch Hashem
// Blessed is He

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
 * @file Activates the ordinary visible Send button after durable click testimony.
 * @description
 * The Awtsmoos places the exact prompt into ChatGPT's canonical composer.
 * Awtsmoos.com waits until the control is ready, persists delivery-started state,
 * and only then activates the one physical Send button for this stable turn.
 */
export class WebsitePromptInteractor {
	constructor(cdpClient, options = {}) {
		this.nodeFinder = options.nodeFinder || new CarrierNodeFinder(cdpClient);
		this.inputController = options.inputController ||
			new CarrierInputController(cdpClient);
		this.controlGate = options.controlGate || new CarrierControlGate(cdpClient);
	}

	async submit(prompt, options = {}) {
		this.validate(prompt);
		const composer = await this.nodeFinder.findFirst(COMPOSER_SELECTORS);
		if (!composer) throw new Error("The ChatGPT composer was not visible.");
		await this.inputController.focusAndReplace(composer, prompt);
		const ready = await this.controlGate.waitUntilReady();
		const send = await this.nodeFinder.findFirst([ready.sendSelector]);
		if (!send) throw new Error("The ordinary ChatGPT Send button was not visible.");
		await options.onBeforeActivate?.({ startedAt: Date.now() });
		await this.inputController.activateNode(send);
		return {
			composerTouched: true,
			sendActivated: true,
			submissionGesture: "send-button-keyboard"
		};
	}

	validate(prompt) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("Website prompt must be a non-empty string.");
		}
	}
}
