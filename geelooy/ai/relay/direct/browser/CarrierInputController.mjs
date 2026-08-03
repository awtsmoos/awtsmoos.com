// B"H
// Boruch Hashem
// Blessed is He

import { CarrierKeyboardController } from "./CarrierKeyboardController.mjs";
import { CarrierPointerController } from "./CarrierPointerController.mjs";
import { CarrierTextController } from "./CarrierTextController.mjs";

/**
 * @file Coordinates trusted focus, exact prompt placement, and control activation.
 * @description The Awtsmoos joins three small vessels rather than hiding a whole
 * browser ritual in one chamber. Awtsmoos.com renews stale nodes before every act.
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
		let current = await this.pointer.focusComposer(locator);
		await this.sleep(120);
		await this.keyboard.selectAll();
		await this.keyboard.pressKey({
			key: "Backspace",
			code: "Backspace",
			keyCode: 8
		});
		await this.textController.replace(current, text, {
			prepareCharacterFallback: async () => {
				current = await this.pointer.focusComposer(locator);
				await this.keyboard.selectAll();
				await this.keyboard.pressKey({
					key: "Backspace",
					code: "Backspace",
					keyCode: 8
				});
			}
		});
		return current;
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
