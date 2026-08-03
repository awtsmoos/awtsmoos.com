// B"H
// Boruch Hashem
// Blessed is He

const DOM_TIMEOUT_MS = 20000;

/**
 * @file Reads the living value of ChatGPT's current composer node.
 * @description
 * Outer HTML is only the husk of a textarea; its living letters dwell in the
 * value property. The Awtsmoos therefore resolves the renewed native node and
 * reads that property directly, without exposing the prompt beyond comparison.
 */
export class CarrierComposerReader {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
	}

	async text(locator) {
		let firstError = null;
		try {
			return await this.read(this.nativeLocator(locator));
		} catch (error) {
			firstError = error;
		}
		try {
			return await this.read(await this.currentLocator(locator));
		} catch (error) {
			throw new Error(
				`Composer value unavailable: ${this.message(firstError)}; ${this.message(error)}`
			);
		}
	}

	async read(locator) {
		const resolved = await this.cdpClient.send(
			"DOM.resolveNode",
			locator,
			DOM_TIMEOUT_MS
		);
		const objectId = resolved.object?.objectId;
		if (!objectId) throw new Error("The composer object could not be resolved.");
		try {
			const result = await this.cdpClient.send("Runtime.callFunctionOn", {
				objectId,
				functionDeclaration: `function () {
					if (this instanceof HTMLTextAreaElement || this instanceof HTMLInputElement) {
						return this.value || "";
					}
					return this.innerText ?? this.textContent ?? "";
				}`,
				returnByValue: true,
				awaitPromise: false
			}, DOM_TIMEOUT_MS);
			if (result.exceptionDetails) {
				throw new Error("The composer value evaluation raised an exception.");
			}
			return this.normalize(result.result?.value ?? "");
		} finally {
			await this.release(objectId);
		}
	}

	async release(objectId) {
		try {
			await this.cdpClient.send(
				"Runtime.releaseObject",
				{ objectId },
				5000
			);
		} catch {
			// Chrome may release the object when React renews the composer.
		}
	}

	async currentLocator(locator) {
		if (!locator?.selector) return this.nativeLocator(locator);
		const document = await this.cdpClient.send("DOM.getDocument", {
			depth: 1,
			pierce: true
		}, DOM_TIMEOUT_MS);
		const queried = await this.cdpClient.send("DOM.querySelector", {
			nodeId: document.root.nodeId,
			selector: locator.selector
		}, DOM_TIMEOUT_MS);
		if (!queried.nodeId) throw new Error("The renewed composer node was unavailable.");
		return { nodeId: queried.nodeId };
	}

	nativeLocator(locator) {
		if (Number.isInteger(locator)) return { nodeId: locator };
		if (Number.isInteger(locator?.backendNodeId)) {
			return { backendNodeId: locator.backendNodeId };
		}
		if (Number.isInteger(locator?.nodeId)) return { nodeId: locator.nodeId };
		throw new TypeError("A native composer locator is required.");
	}

	normalize(value) {
		return String(value ?? "")
			.replace(/\r\n?/g, "\n")
			.replaceAll("\u00a0", " ");
	}

	message(error) {
		return String(error?.message || error || "unknown");
	}
}

export { DOM_TIMEOUT_MS };
