//B"H
// Boruch Hashem
// Blessed is He

/**
 * Guest textarea and authenticated ProseMirror are two vessels for one human
 * intention. The Awtsmoos reveals the visible vessel; awtsmoos.com never types
 * into a hidden fallback merely because it appeared first in document order.
 */
export class NaturalChatInteractor {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
		this.selectors = [
			"div#prompt-textarea[contenteditable='true']",
			"textarea#mobile-composer-prompt",
			"textarea[aria-label='Chat with ChatGPT']",
			"[contenteditable='true'][role='textbox']"
		];
	}

	async submit(prompt) {
		const previousCount = await this.countAssistantMessages();
		const focused = await this.evaluate(`(() => {
			const selectors = ${JSON.stringify(this.selectors)};
			const visible = (element) => Boolean(
				element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length)
			);
			const composer = selectors.map((selector) => document.querySelector(selector)).find(visible);
			if (!composer) return false;
			composer.focus();
			return document.activeElement === composer;
		})()`);

		if (!focused) {
			throw new Error("The visible ChatGPT composer could not be focused.");
		}

		await this.cdpClient.send("Input.insertText", { text: prompt });
		const inserted = await this.readComposerText();
		if (!inserted.includes(prompt)) {
			throw new Error("The prompt did not enter the visible ChatGPT composer.");
		}

		await this.dispatchEnter();
		return previousCount;
	}

	async waitForReply({ previousCount, onstream, timeoutMs = 90000, pollMs = 350 }) {
		const deadline = Date.now() + timeoutMs;
		let latestText = "";
		let stablePolls = 0;

		while (Date.now() < deadline) {
			const messages = await this.readAssistantMessages();
			const currentText = messages.length > previousCount ? messages.at(-1) : "";
			if (currentText && currentText !== latestText) {
				latestText = currentText;
				stablePolls = 0;
				await onstream?.(currentText);
			} else if (currentText) {
				stablePolls += 1;
			}
			if (latestText && stablePolls >= 4 && await this.composerIsEmpty()) {
				return latestText;
			}
			await new Promise((resolve) => setTimeout(resolve, pollMs));
		}

		throw new Error("Timed out waiting for a stable ChatGPT reply.");
	}

	async readAssistantMessages() {
		return this.evaluate(`(() => {
			const modern = [...document.querySelectorAll('[data-message-author-role="assistant"]')];
			const mobile = [...document.querySelectorAll('[class*="assistantMessage"] [class*="messageCopy"]')];
			const selected = modern.length > 0 ? modern : mobile;
			return selected.map((element) => element.innerText.trim()).filter(Boolean);
		})()`);
	}

	async countAssistantMessages() {
		return (await this.readAssistantMessages()).length;
	}

	async readComposerText() {
		return this.evaluate(`(() => {
			const selectors = ${JSON.stringify(this.selectors)};
			const visible = (element) => Boolean(element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length));
			const composer = selectors.map((selector) => document.querySelector(selector)).find(visible);
			return (composer?.value ?? composer?.innerText ?? '').trim();
		})()`);
	}

	async composerIsEmpty() {
		return (await this.readComposerText()) === "";
	}

	async dispatchEnter() {
		const event = { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 };
		await this.cdpClient.send("Input.dispatchKeyEvent", { type: "keyDown", ...event });
		await this.cdpClient.send("Input.dispatchKeyEvent", { type: "keyUp", ...event });
	}

	async evaluate(expression) {
		const result = await this.cdpClient.send("Runtime.evaluate", { expression, returnByValue: true });
		return result.result.value;
	}
}
