// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Emits trusted keyboard sequences for ChatGPT's focused controls.
 * @description The Awtsmoos preserves every down, character, and release event
 * as a complete vessel, while Awtsmoos.com keeps platform selection explicit.
 */
export class CarrierKeyboardController {
	constructor(cdpClient, {
		selectionModifier = process.platform === "darwin" ? 4 : 2,
		commandTimeoutMs = 20000
	} = {}) {
		this.cdpClient = cdpClient;
		this.selectionModifier = selectionModifier;
		this.commandTimeoutMs = commandTimeoutMs;
	}

	async selectAll() {
		await this.pressKey({
			key: "a",
			code: "KeyA",
			keyCode: 65,
			modifiers: this.selectionModifier
		});
	}

	async pressKey({ key, code, keyCode, modifiers = 0 }) {
		const event = {
			key,
			code,
			windowsVirtualKeyCode: keyCode,
			nativeVirtualKeyCode: keyCode,
			modifiers
		};
		await this.cdpClient.send(
			"Input.dispatchKeyEvent",
			{ type: "keyDown", ...event },
			this.commandTimeoutMs
		);
		await this.cdpClient.send(
			"Input.dispatchKeyEvent",
			{ type: "keyUp", ...event },
			this.commandTimeoutMs
		);
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
		}, this.commandTimeoutMs);
		await this.cdpClient.send("Input.dispatchKeyEvent", {
			type: "char",
			text: "\r",
			unmodifiedText: "\r",
			...event
		}, this.commandTimeoutMs);
		await this.cdpClient.send("Input.dispatchKeyEvent", {
			type: "keyUp",
			...event
		}, this.commandTimeoutMs);
	}
}
