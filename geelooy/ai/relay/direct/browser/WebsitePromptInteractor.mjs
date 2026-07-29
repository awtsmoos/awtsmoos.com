//B"H
// Boruch Hashem
// Blessed is He

import { CarrierControlGate } from "./CarrierControlGate.mjs";
import { CarrierInputController } from "./CarrierInputController.mjs";
import { CarrierNodeFinder } from "./CarrierNodeFinder.mjs";

const COMPOSER_SELECTORS = [
	"div#prompt-textarea[contenteditable='true']",
	"textarea#mobile-composer-prompt",
	"textarea[aria-label='Chat with ChatGPT']",
	"[contenteditable='true'][role='textbox']"
];

/**
 * The real prompt enters the ordinary authenticated ChatGPT composer once. The
 * Awtsmoos uses the site's own send control and enforcement flow without changing,
 * replaying, suppressing, or fabricating the request that ChatGPT creates.
 */
export class WebsitePromptInteractor {
	constructor(cdpClient, {
		nodeFinder = new CarrierNodeFinder(cdpClient),
		inputController = new CarrierInputController(cdpClient),
		controlGate = new CarrierControlGate(cdpClient)
	} = {}) {
		this.nodeFinder = nodeFinder;
		this.inputController = inputController;
		this.controlGate = controlGate;
	}

	async submit(prompt) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("Website prompt must be a non-empty string.");
		}
		const composer = await this.nodeFinder.findFirst(COMPOSER_SELECTORS);
		if (!composer) throw new Error("The ChatGPT composer was not visible.");
		await this.inputController.focusAndReplace(composer, prompt);
		const state = await this.controlGate.waitUntilReady();
		const send = await this.nodeFinder.findFirst([state.sendSelector]);
		if (!send) throw new Error("The enabled ChatGPT send control disappeared.");
		await this.inputController.clickNode(send);
		return { composerTouched: true, sendClicked: true };
	}
}
