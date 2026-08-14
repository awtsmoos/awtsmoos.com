// B"H
// Boruch Hashem
// Blessed is He

import { CarrierKeyboardController } from "./CarrierKeyboardController.mjs";
import { CarrierPointerController } from "./CarrierPointerController.mjs";
import { CarrierTextController } from "./CarrierTextController.mjs";

/**
 * @file Coordinates trusted focus, exact prompt placement, and control activation.
 * @description The Awtsmoos focuses the renewed node while preserving the original
 * selector-bearing locator, so React replacement can never sever verification.
 */
export class CarrierInputController {
	constructor(cdpClient, {
		selectionModifier = process.platform === "darwin" ? 4 : 2,
		commandTimeoutMs = 20000,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		textController = new CarrierTextController(cdpClient),
		keyboardController = null,
		pointerController = null
	} = {}) {
		this.cdpClient = cdpClient;
		this.sleep = sleep;
		this.textController = textController;
		this.keyboard = keyboardController || new CarrierKeyboardController(cdpClient, {
			selectionModifier,
			commandTimeoutMs
		});
		this.pointer = pointerController || new CarrierPointerController(
			cdpClient,
			textController,
			{ commandTimeoutMs, sleep }
		);
	}

	async focusAndReplace(locator, text) {
		await this.pointer.focusComposer(locator);
		await this.sleep(120);
		await this.clearFocusedComposer();
		await this.textController.replace(locator, text, {
			prepareCharacterFallback: async () => {
				await this.pointer.focusComposer(locator);
				await this.clearFocusedComposer();
			}
		});
		return this.textController.currentLocator(locator);
	}

	async clearFocusedComposer() {
		await this.keyboard.selectAll();
		await this.keyboard.pressKey({
			key: "Backspace",
			code: "Backspace",
			keyCode: 8
		});
	}

	async activateNode(locator) {
		const activated = await this.pointer.activate(locator);
		if (activated.mode === "focused") {
			await this.keyboard.pressKey({
				key: "Enter",
				code: "Enter",
				keyCode: 13
			});
		}
		return activated.locator;
	}

	async submitFocusedComposer() {
		await this.keyboard.submitFocusedComposer();
	}
}
