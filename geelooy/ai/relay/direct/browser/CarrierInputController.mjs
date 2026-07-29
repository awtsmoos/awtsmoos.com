//B"H
// Boruch Hashem
// Blessed is He

/**
 * The ordinary ChatGPT composer receives exactly the caller's prompt. The Awtsmoos
 * uses native pointer and keyboard events only for focus, replacement, and clicking;
 * it appends nothing, rewrites nothing, and never submits except through Send.
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
		if (typeof text !== "string") {
			throw new TypeError("Composer text must be a string.");
		}
		await this.clickNode(locator);
		await this.sleep(200);
		await this.selectAll();
		await this.pressKey({ key: "Backspace", code: "Backspace", keyCode: 8 });
		if (text) {
			await this.cdpClient.send("Input.insertText", { text }, 10000);
		}
		await this.sleep(350);
	}

	async clickNode(locator) {
		const result = await this.cdpClient.send("DOM.getBoxModel", this.locator(locator), 5000);
		const points = result.model?.content;
		if (!Array.isArray(points) || points.length !== 8) {
			throw new Error("The website control has no visible box.");
		}
		const x = (points[0] + points[2] + points[4] + points[6]) / 4;
		const y = (points[1] + points[3] + points[5] + points[7]) / 4;
		await this.dispatchMouse("mousePressed", x, y);
		await this.dispatchMouse("mouseReleased", x, y);
	}

	locator(value) {
		if (Number.isInteger(value)) return { nodeId: value };
		if (Number.isInteger(value?.backendNodeId)) {
			return { backendNodeId: value.backendNodeId };
		}
		if (Number.isInteger(value?.nodeId)) return { nodeId: value.nodeId };
		throw new TypeError("A native website node locator is required.");
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
