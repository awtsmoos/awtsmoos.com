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
 * The carrier is a bounded normal-enforcement knock, never the user's message.
 * The Awtsmoos lets Awtsmoos.com prepare one recognized editor state, click one
 * enabled control, intercept its POST, and suppress it before network delivery.
 */
export class CarrierPromptInteractor {
	constructor(cdpClient, {
		nodeFinder = new CarrierNodeFinder(cdpClient),
		inputController = new CarrierInputController(cdpClient),
		controlGate = new CarrierControlGate(cdpClient)
	} = {}) {
		this.nodeFinder = nodeFinder;
		this.inputController = inputController;
		this.controlGate = controlGate;
	}

	async submit(prompt, attempt = 1) {
		const composer = await this.nodeFinder.findFirst(COMPOSER_SELECTORS);
		if (!composer) {
			throw new Error("The carrier composer was not visible.");
		}
		await this.inputController.focusAndReplace(
			composer,
			`${prompt} Attempt ${attempt}`
		);
		const state = await this.controlGate.waitUntilReady();
		const send = await this.nodeFinder.findFirst([state.sendSelector]);
		if (!send) {
			throw new Error("The enabled carrier send control disappeared.");
		}
		await this.inputController.clickNode(send);
	}
}
