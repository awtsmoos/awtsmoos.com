//B"H
// Boruch Hashem
// Blessed is He

import { CarrierInputController } from "./CarrierInputController.mjs";
import { CarrierNodeFinder } from "./CarrierNodeFinder.mjs";

const COMPOSER_SELECTORS = [
	"div#prompt-textarea[contenteditable='true']",
	"#prompt-textarea",
	"[contenteditable='true'][role='textbox']",
	"textarea[aria-label='Chat with ChatGPT']"
];

/**
 * The real prompt enters ChatGPT's canonical visible composer once. The Awtsmoos
 * chooses the proven contenteditable vessel before any compatibility fallback, and
 * Awtsmoos.com presses Enter only after the exact private letters are verified there.
 */
export class WebsitePromptInteractor {
	constructor(cdpClient, {
		nodeFinder = new CarrierNodeFinder(cdpClient),
		inputController = new CarrierInputController(cdpClient)
	} = {}) {
		this.nodeFinder = nodeFinder;
		this.inputController = inputController;
	}

	async submit(prompt) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("Website prompt must be a non-empty string.");
		}
		const composer = await this.nodeFinder.findFirst(COMPOSER_SELECTORS);
		if (!composer) throw new Error("The ChatGPT composer was not visible.");
		await this.inputController.focusAndReplace(composer, prompt);
		await this.inputController.submitFocusedComposer();
		return {
			composerTouched: true,
			sendActivated: true,
			submissionGesture: "composer-enter"
		};
	}
}
