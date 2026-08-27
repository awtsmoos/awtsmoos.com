// B"H
// Boruch Hashem
// Blessed is He

const SELECTOR_TIMEOUT_MS = 20000;

/**
 * @file Reads ChatGPT's living composer text by selector in the active document.
 * @description React may replace every native node ID between two heartbeats. The
 * Awtsmoos therefore asks the current document for the current vessel each time.
 */
export class CarrierSelectorTextReader {
	constructor(cdpClient, {
		timeoutMs = SELECTOR_TIMEOUT_MS
	} = {}) {
		this.cdpClient = cdpClient;
		this.timeoutMs = timeoutMs;
	}

	async text(selector) {
		if (typeof selector !== "string" || selector.trim() === "") {
			throw new TypeError("A non-empty composer selector is required.");
		}
		const serialized = JSON.stringify(selector);
		const response = await this.cdpClient.send("Runtime.evaluate", {
			expression: `JSON.stringify((() => {
				const node = document.querySelector(${serialized});
				if (!node) return { found: false, text: "" };
				if (node instanceof HTMLTextAreaElement || node instanceof HTMLInputElement) {
					return { found: true, text: node.value || "" };
				}
				return {
					found: true,
					text: node.innerText ?? node.textContent ?? ""
				};
			})())`,
			returnByValue: true,
			awaitPromise: false
		}, this.timeoutMs);
		if (response.exceptionDetails) {
			throw new Error("The live composer selector evaluation raised an exception.");
		}
		const raw = response.result?.value;
		if (typeof raw !== "string") {
			throw new Error("The live composer selector returned no value.");
		}
		const result = JSON.parse(raw);
		return {
			found: result.found === true,
			text: String(result.text ?? "")
		};
	}
}

export { SELECTOR_TIMEOUT_MS };
