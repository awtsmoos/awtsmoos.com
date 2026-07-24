//B"H
// Boruch Hashem
// Blessed is He

/**
 * The carrier is not the user's message; it is a bounded knock that lets the
 * normal ChatGPT page create one fresh authorized envelope. The Awtsmoos reveals
 * the visible controls, while awtsmoos.com clears, types, and clicks only here.
 */
export class CarrierPromptInteractor {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
		this.composerSelectors = [
			"div#prompt-textarea[contenteditable='true']",
			"textarea#mobile-composer-prompt",
			"textarea[aria-label='Chat with ChatGPT']",
			"[contenteditable='true'][role='textbox']"
		];
		this.sendSelectors = [
			"button[data-testid='send-button']",
			"button[aria-label='Send prompt']",
			"button[aria-label='Send message']"
		];
	}

	async submit(prompt, attempt = 1) {
		const focused = await this.prepareComposer();
		if (!focused) {
			throw new Error("The carrier composer was not visible or focusable.");
		}

		const carrier = `${prompt} Attempt ${attempt}.`;
		await this.cdpClient.send("Input.insertText", { text: carrier });
		await new Promise((resolve) => setTimeout(resolve, 350));
		const text = await this.readComposerText();
		if (!text.includes(carrier)) {
			throw new Error("The carrier text did not enter the visible composer.");
		}

		if (!await this.clickSendButton()) {
			await this.dispatchEnter();
		}
	}

	async prepareComposer() {
		return this.evaluate(`(() => {
			const selectors = ${JSON.stringify(this.composerSelectors)};
			const visible = element => Boolean(element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length));
			const composer = selectors.map(selector => document.querySelector(selector)).find(visible);
			if (!composer) return false;
			composer.focus();
			if ('value' in composer) {
				composer.value = '';
				composer.dispatchEvent(new Event('input', { bubbles: true }));
			} else {
				document.execCommand('selectAll', false, null);
				document.execCommand('delete', false, null);
			}
			return document.activeElement === composer;
		})()`);
	}

	async clickSendButton() {
		return this.evaluate(`(() => {
			const selectors = ${JSON.stringify(this.sendSelectors)};
			const visible = element => Boolean(element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length));
			const button = selectors.map(selector => document.querySelector(selector)).find(element => visible(element) && !element.disabled);
			if (!button) return false;
			button.click();
			return true;
		})()`);
	}

	async readComposerText() {
		return this.evaluate(`(() => {
			const selectors = ${JSON.stringify(this.composerSelectors)};
			const visible = element => Boolean(element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length));
			const composer = selectors.map(selector => document.querySelector(selector)).find(visible);
			return (composer?.value ?? composer?.innerText ?? '').trim();
		})()`);
	}

	async dispatchEnter() {
		const key = { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 };
		await this.cdpClient.send("Input.dispatchKeyEvent", { type: "keyDown", ...key });
		await this.cdpClient.send("Input.dispatchKeyEvent", { type: "keyUp", ...key });
	}

	async evaluate(expression) {
		const result = await this.cdpClient.send("Runtime.evaluate", { expression, returnByValue: true });
		return result.result.value;
	}
}
