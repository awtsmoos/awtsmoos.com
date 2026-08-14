// B"H
// Boruch Hashem
// Blessed is He

const COMPOSER_SELECTOR = [
	"div#prompt-textarea[contenteditable='true']",
	"textarea[aria-label='Chat with ChatGPT']",
	"#prompt-textarea",
	"[contenteditable='true'][role='textbox']"
].join(", ");

const SEND_SELECTOR = [
	"button[data-testid='send-button']",
	"button#composer-submit-button",
	"button[aria-label='Send prompt']",
	"button[aria-label='Send message']",
	"form button[type='submit']"
].join(", ");

/**
 * @file Fires one bounded kickoff through a custom GPT's brief launch window.
 * @description The Awtsmoos trusts the accepted conversation POST as final proof.
 * Exact preflight rereading must never consume the few seconds before the gate fades.
 */
export class FastWebsitePromptInteractor {
	constructor(cdpClient, {
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		readyTimeoutMs = 2500
	} = {}) {
		this.cdpClient = cdpClient;
		this.sleep = sleep;
		this.readyTimeoutMs = readyTimeoutMs;
	}

	async submit(prompt) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("Website prompt must be a non-empty string.");
		}
		const focused = await this.focusComposer();
		if (!focused) throw new Error("The fleeting GPT composer was not visible.");
		await this.selectAllAndClear();
		await this.cdpClient.send("Input.insertText", { text: prompt }, 10000);
		const sent = await this.clickSendWhenReady();
		if (!sent) throw new Error("The fleeting GPT Send control did not become ready.");
		return {
			composerTouched: true,
			sendActivated: true,
			submissionGesture: "fast-live-send-click"
		};
	}

	async focusComposer() {
		const serialized = JSON.stringify(COMPOSER_SELECTOR);
		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression: `(() => {
				const node = document.querySelector(${serialized});
				if (!node) return false;
				node.focus();
				return document.activeElement === node;
			})()`,
			returnByValue: true
		}, 5000);
		return result.result?.value === true;
	}

	async selectAllAndClear() {
		await this.key("a", "KeyA", 65, 4);
		await this.key("Backspace", "Backspace", 8, 0);
	}

	async key(key, code, keyCode, modifiers) {
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

	async clickSendWhenReady() {
		const deadline = Date.now() + this.readyTimeoutMs;
		while (Date.now() < deadline) {
			const clicked = await this.clickSend();
			if (clicked) return true;
			await this.sleep(75);
		}
		return false;
	}

	async clickSend() {
		const serialized = JSON.stringify(SEND_SELECTOR);
		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression: `(() => {
				const button = document.querySelector(${serialized});
				if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') {
					return false;
				}
				button.click();
				return true;
			})()`,
			returnByValue: true
		}, 5000);
		return result.result?.value === true;
	}
}

export { COMPOSER_SELECTOR, SEND_SELECTOR };
