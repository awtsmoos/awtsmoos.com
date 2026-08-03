//B"H
// Boruch Hashem
// Blessed is He

import { CarrierTextController } from "./CarrierTextController.mjs";

/**
 * The ordinary ChatGPT composer receives exactly the caller's prompt. The Awtsmoos
 * verifies its letters before Send, while Awtsmoos.com uses the browser's complete
 * raw-key, character, and key-up Enter sequence only after the text is truly present.
 */
export class CarrierInputController {
	constructor(cdpClient, {
		selectionModifier = process.platform === "darwin" ? 4 : 2,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		textController = new CarrierTextController(cdpClient)
	} = {}) {
		this.cdpClient = cdpClient;
		this.selectionModifier = selectionModifier;
		this.sleep = sleep;
		this.textController = textController;
	}

	async focusAndReplace(locator, text) {
		if (typeof text !== "string") throw new TypeError("Composer text must be a string.");
		await this.focusComposer(locator);
		await this.sleep(150);
		await this.selectAll();
		await this.pressKey({ key: "Backspace", code: "Backspace", keyCode: 8 });
		await this.textController.replace(locator, text, {
			prepareCharacterFallback: async renewedLocator => {
				await this.focusComposer(renewedLocator);
				await this.selectAll();
				await this.pressKey({
					key: "Backspace",
					code: "Backspace",
					keyCode: 8
				});
			}
		});
		await this.sleep(300);
	}

	async activateNode(locator) {
		await this.focusNode(locator);
		await this.pressKey({ key: "Enter", code: "Enter", keyCode: 13 });
	}

	async submitFocusedComposer() {
		const event = {
			key: "Enter",
			code: "Enter",
			windowsVirtualKeyCode: 13,
			nativeVirtualKeyCode: 13
		};
		await this.cdpClient.send("Input.dispatchKeyEvent", {
			type: "rawKeyDown",
			...event
		}, 5000);
		await this.cdpClient.send("Input.dispatchKeyEvent", {
			type: "char",
			text: "\r",
			unmodifiedText: "\r",
			...event
		}, 5000);
		await this.cdpClient.send("Input.dispatchKeyEvent", {
			type: "keyUp",
			...event
		}, 5000);
	}

	async focusComposer(locator) {
		try {
			await this.focusNode(locator);
		} catch (error) {
			if (!String(error?.message).includes("not focusable")) throw error;
			await this.clickVisibleCenter(locator);
		}
	}

	async focusNode(locator) {
		await this.cdpClient.send("DOM.focus", this.locator(locator), 5000);
	}

	async clickVisibleCenter(locator) {
		const model = await this.cdpClient.send("DOM.getBoxModel", this.locator(locator), 5000);
		const content = model.model?.content;
		if (!Array.isArray(content) || content.length !== 8) {
			throw new Error("The visible composer geometry was unavailable.");
		}
		const x = (content[0] + content[2] + content[4] + content[6]) / 4;
		const y = (content[1] + content[3] + content[5] + content[7]) / 4;
		for (const type of ["mousePressed", "mouseReleased"]) {
			await this.dispatchSafeComposerClick({ type, x, y });
		}
	}

	async dispatchSafeComposerClick({ type, x, y }) {
		try {
			await this.cdpClient.send("Input.dispatchMouseEvent", {
				type,
				x,
				y,
				button: "left",
				clickCount: 1
			}, 5000);
		} catch (error) {
			if (!String(error?.message).includes("timeout")) throw error;
		}
	}

	locator(value) {
		if (Number.isInteger(value)) return { nodeId: value };
		if (Number.isInteger(value?.backendNodeId)) return { backendNodeId: value.backendNodeId };
		if (Number.isInteger(value?.nodeId)) return { nodeId: value.nodeId };
		throw new TypeError("A native website node locator is required.");
	}

	async selectAll() {
		await this.pressKey({ key: "a", code: "KeyA", keyCode: 65, modifiers: this.selectionModifier });
	}

	async pressKey({ key, code, keyCode, modifiers = 0 }) {
		const event = { key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode, modifiers };
		await this.cdpClient.send("Input.dispatchKeyEvent", { type: "keyDown", ...event }, 5000);
		await this.cdpClient.send("Input.dispatchKeyEvent", { type: "keyUp", ...event }, 5000);
	}
}
