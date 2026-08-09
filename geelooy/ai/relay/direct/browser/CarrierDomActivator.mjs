// B"H
// Boruch Hashem
// Blessed is He

/** Renews React-owned nodes and activates them without stale screen geometry. */
export class CarrierDomActivator {
	constructor(cdpClient, textController, { commandTimeoutMs = 20000 } = {}) {
		this.cdpClient = cdpClient;
		this.textController = textController;
		this.commandTimeoutMs = commandTimeoutMs;
	}

	async currentLocator(locator) {
		return this.textController.currentLocator(locator);
	}

	async activate(locator) {
		let objectId = null;
		try {
			const resolved = await this.cdpClient.send(
				"DOM.resolveNode",
				this.nativeLocator(locator),
				this.commandTimeoutMs
			);
			objectId = resolved.object?.objectId;
			if (!objectId) return false;
			const result = await this.cdpClient.send("Runtime.callFunctionOn", {
				objectId,
				functionDeclaration: `function () {
					this.focus?.();
					this.click?.();
					return true;
				}`,
				returnByValue: true
			}, this.commandTimeoutMs);
			return result.result?.value === true;
		} catch {
			return false;
		} finally {
			if (objectId) await this.release(objectId);
		}
	}

	async release(objectId) {
		try {
			await this.cdpClient.send("Runtime.releaseObject", { objectId }, 5000);
		} catch {
			// React may release the object first.
		}
	}

	nativeLocator(locator) {
		if (Number.isInteger(locator)) return { nodeId: locator };
		if (Number.isInteger(locator?.backendNodeId)) {
			return { backendNodeId: locator.backendNodeId };
		}
		if (Number.isInteger(locator?.nodeId)) return { nodeId: locator.nodeId };
		throw new TypeError("A native carrier node locator is required.");
	}

	transient(error) {
		return /node with given id|not focusable|box model|detached|document|timeout|socket/i
			.test(String(error?.message || error));
	}
}
