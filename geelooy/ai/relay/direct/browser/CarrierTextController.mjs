//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos verifies each exact letter in the newest composer node after React
 * renews the page. Awtsmoos.com keeps the prompt private, re-queries stale vessels,
 * and falls back to one native character event per code point before Send may arise.
 */
export class CarrierTextController {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
	}

	async replace(locator, text, { prepareCharacterFallback = null } = {}) {
		let insertError = null;
		try {
			await this.insertText(text);
		} catch (error) {
			insertError = error;
		}
		if (await this.containsEventually(locator, text)) return;
		if (typeof prepareCharacterFallback !== "function") {
			throw insertError || new Error("The exact prompt did not enter the ChatGPT composer.");
		}
		await prepareCharacterFallback(await this.currentLocator(locator));
		await this.dispatchCharacters(text);
		if (await this.containsEventually(locator, text)) return;
		throw new Error("The exact prompt did not enter the ChatGPT composer.");
	}

	async containsEventually(locator, text) {
		let lastError = null;
		for (let attempt = 0; attempt < 3; attempt += 1) {
			try {
				if (await this.contains(locator, text)) return true;
				lastError = null;
			} catch (error) {
				lastError = error;
			}
			await new Promise(resolve => setTimeout(resolve, 250));
		}
		if (lastError) throw lastError;
		return false;
	}

	async insertText(text) {
		try {
			await this.cdpClient.send("Input.insertText", { text }, 20000);
		} catch (error) {
			throw this.stageError("Input.insertText", error);
		}
	}

	async contains(locator, text) {
		try {
			const current = await this.currentLocator(locator);
			const result = await this.cdpClient.send("DOM.getOuterHTML", current, 20000);
			return this.composerText(result.outerHTML) === this.normalizeText(text);
		} catch (error) {
			throw this.stageError("DOM.getOuterHTML", error);
		}
	}

	async currentLocator(locator) {
		if (!locator?.selector) return this.nativeLocator(locator);
		const document = await this.cdpClient.send("DOM.getDocument", {
			depth: 1,
			pierce: true
		}, 20000);
		const queried = await this.cdpClient.send("DOM.querySelector", {
			nodeId: document.root.nodeId,
			selector: locator.selector
		}, 20000);
		if (!queried.nodeId) throw new Error("The renewed composer node was unavailable.");
		return { nodeId: queried.nodeId };
	}

	nativeLocator(locator) {
		if (Number.isInteger(locator)) return { nodeId: locator };
		if (Number.isInteger(locator?.backendNodeId)) return { backendNodeId: locator.backendNodeId };
		if (Number.isInteger(locator?.nodeId)) return { nodeId: locator.nodeId };
		throw new TypeError("A native composer locator is required.");
	}

	async dispatchCharacters(text) {
		for (const character of text) {
			try {
				await this.cdpClient.send("Input.dispatchKeyEvent", {
					type: "char",
					text: character,
					unmodifiedText: character
				}, 10000);
			} catch (error) {
				throw this.stageError("Input.dispatchKeyEvent(char)", error);
			}
		}
	}

	composerText(outerHtml) {
		const html = String(outerHtml ?? "");
		const openingEnd = html.indexOf(">");
		const closingStart = html.lastIndexOf("</");
		const inner = openingEnd >= 0 && closingStart > openingEnd
			? html.slice(openingEnd + 1, closingStart)
			: html;
		return this.normalizeText(inner
			.replace(/<br\s*\/?>/gi, "\n")
			.replace(/<\/(?:p|div|li)>/gi, "\n")
			.replace(/<[^>]+>/g, "")
			.replace(/\n$/, ""));
	}

	normalizeText(value) {
		return String(value ?? "")
			.replaceAll("&quot;", '"')
			.replaceAll("&#x27;", "'")
			.replaceAll("&#39;", "'")
			.replaceAll("&lt;", "<")
			.replaceAll("&gt;", ">")
			.replaceAll("&nbsp;", " ")
			.replace(/&#x([0-9a-f]+);/gi, (_match, hex) => {
				return String.fromCodePoint(Number.parseInt(hex, 16));
			})
			.replace(/&#([0-9]+);/g, (_match, decimal) => {
				return String.fromCodePoint(Number.parseInt(decimal, 10));
			})
			.replaceAll("&amp;", "&")
			.replace(/\r\n?/g, "\n")
			.replaceAll("\u00a0", " ");
	}

	stageError(stage, error) {
		return new Error(`${stage} failed: ${String(error?.message || error)}`);
	}
}
