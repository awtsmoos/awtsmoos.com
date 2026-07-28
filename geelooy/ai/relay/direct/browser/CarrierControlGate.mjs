//B"H
// Boruch Hashem
// Blessed is He

const SEND_SELECTORS = [
	"button[data-testid='send-button']",
	"button[aria-label='Send prompt']",
	"button[aria-label='Send message']"
];

/**
 * One boolean gate waits until ChatGPT has registered the harmless carrier and
 * exposed an enabled native send control. The Awtsmoos lets Awtsmoos.com inspect
 * no message text—only focus, positive length, visibility, and enabled state.
 */
export class CarrierControlGate {
	constructor(cdpClient, {
		timeoutMs = 5000,
		intervalMs = 200,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
	} = {}) {
		this.cdpClient = cdpClient;
		this.timeoutMs = timeoutMs;
		this.intervalMs = intervalMs;
		this.sleep = sleep;
	}

	async waitUntilReady() {
		const deadline = Date.now() + this.timeoutMs;
		let state = null;
		while (Date.now() < deadline) {
			state = await this.inspect();
			if (state.ready) {
				return state;
			}
			await this.sleep(this.intervalMs);
		}
		throw new Error(
			`Carrier control did not become ready: ${state?.reason || "unknown"}.`
		);
	}

	async inspect() {
		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression: this.expression(),
			returnByValue: true
		}, 5000);
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text || "Carrier readiness failed.");
		}
		return result.result.value;
	}

	expression() {
		return `(() => {
			const visible = element => Boolean(element && (
				element.offsetWidth || element.offsetHeight || element.getClientRects().length
			));
			const composer = [
				'div#prompt-textarea[contenteditable="true"]',
				'textarea#mobile-composer-prompt',
				'textarea[aria-label="Chat with ChatGPT"]',
				'[contenteditable="true"][role="textbox"]'
			].map(selector => document.querySelector(selector)).find(visible);
			const text = composer?.value ?? composer?.innerText ?? composer?.textContent ?? '';
			const selector = ${JSON.stringify(SEND_SELECTORS)}.find(candidate => {
				const button = document.querySelector(candidate);
				return visible(button)
					&& !button.disabled
					&& button.getAttribute('aria-disabled') !== 'true';
			});
			const focused = document.activeElement === composer || composer?.contains(document.activeElement);
			const ready = Boolean(focused && String(text).length > 0 && selector);
			return {
				ready,
				sendSelector: selector || null,
				reason: !composer ? 'composer_missing'
					: !focused ? 'composer_unfocused'
					: String(text).length === 0 ? 'composer_empty'
					: !selector ? 'send_disabled'
					: 'ready'
			};
		})()`;
	}
}

export { SEND_SELECTORS };
