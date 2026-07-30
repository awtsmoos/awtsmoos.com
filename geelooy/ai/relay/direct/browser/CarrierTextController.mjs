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

	async replace(locator, text) {
		await this.insertText(text);
		if (await this.contains(locator, text)) return;
		await this.dispatchCharacters(text);
		if (await this.contains(locator, text)) return;
		throw new Error("The exact prompt did not enter the ChatGPT composer.");
	}

	async insertText(text) {
		try {
			await this.cdpClient.send("Input.insertText", { text }, 10000);
		} catch (error) {
			throw this.stageError("Input.insertText", error);
		}
	}

	async contains(locator, text) {
		try {
			const current = await this.currentLocator(locator);
			const result = await this.cdpClient.send("DOM.getOuterHTML", current, 10000);
			return this.normalize(result.outerHTML).includes(this.normalize(text));
		} catch (error) {
			throw this.stageError("DOM.getOuterHTML", error);
		}
	}

	async currentLocator(locator) {
		if (!locator?.selector) return this.nativeLocator(locator);
		const document = await this.cdpClient.send("DOM.getDocument", {
			depth: 1,
			pierce: true
		}, 10000);
		const queried = await this.cdpClient.send("DOM.querySelector", {
			nodeId: document.root.nodeId,
			selector: locator.selector
		}, 10000);
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
				}, 5000);
			} catch (error) {
				throw this.stageError("Input.dispatchKeyEvent(char)", error);
			}
		}
	}

	normalize(value) {
		return String(value ?? "")
			.replaceAll("&quot;", '"')
			.replaceAll("&amp;", "&")
			.replaceAll("&#39;", "'")
			.replace(/<[^>]+>/g, "")
			.replace(/\s+/g, " ")
			.trim();
	}

	stageError(stage, error) {
		return new Error(`${stage} failed: ${String(error?.message || error)}`);
	}
}
