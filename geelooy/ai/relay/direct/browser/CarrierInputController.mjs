//B"H
// Boruch Hashem
// Blessed is He

/**
 * One native pointer gesture awakens ChatGPT's active editor, then compact browser
 * input prepares a harmless carrier. The Awtsmoos lets Awtsmoos.com avoid blind
 * DOM focus while every final carrier POST remains intercepted and suppressed.
 */
export class CarrierInputController {
	constructor(cdpClient, {
		selectionModifier = process.platform === "darwin" ? 4 : 2,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
	} = {}) {
		this.cdpClient = cdpClient;
		this.selectionModifier = selectionModifier;
		this.sleep = sleep;
	}

	async focusAndReplace(locator, text) {
		await this.clickNode(locator);
		await this.sleep(250);
		await this.selectAll();
		await this.pressKey({ key: "Backspace", code: "Backspace", keyCode: 8 });
		await this.cdpClient.send("Input.insertText", { text }, 10000);
		await this.dispatchCharacter(".", "Period", 190);
		await this.sleep(300);
	}

	async clickNode(locator) {
		const result = await this.cdpClient.send("DOM.getBoxModel", this.locator(locator), 5000);
		const points = result.model?.content;
		if (!Array.isArray(points) || points.length !== 8) {
			throw new Error("The carrier control has no visible box.");
		}
		const x = (points[0] + points[2] + points[4] + points[6]) / 4;
		const y = (points[1] + points[3] + points[5] + points[7]) / 4;
		await this.dispatchMouse("mousePressed", x, y);
		await this.dispatchMouse("mouseReleased", x, y);
	}

	locator(value) {
		if (Number.isInteger(value)) {
			return { nodeId: value };
		}
		if (Number.isInteger(value?.backendNodeId)) {
			return { backendNodeId: value.backendNodeId };
		}
		if (Number.isInteger(value?.nodeId)) {
			return { nodeId: value.nodeId };
		}
		throw new TypeError("A native carrier node locator is required.");
	}

	async dispatchCharacter(text, code, keyCode) {
		await this.cdpClient.send("Input.dispatchKeyEvent", {
			type: "char",
			key: text,
			code,
			text,
			unmodifiedText: text,
			windowsVirtualKeyCode: keyCode,
			nativeVirtualKeyCode: keyCode
		}, 5000);
	}

	async dispatchMouse(type, x, y) {
		await this.cdpClient.send("Input.dispatchMouseEvent", {
			type,
			x,
			y,
			button: "left",
			clickCount: 1
		}, 5000);
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
		await this.cdpClient.send("Input.dispatchKeyEvent", {
			type: "keyDown",
			...event
		}, 5000);
		await this.cdpClient.send("Input.dispatchKeyEvent", {
			type: "keyUp",
			...event
		}, 5000);
	}
}
