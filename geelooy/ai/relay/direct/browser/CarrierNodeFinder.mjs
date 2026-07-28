//B"H
// Boruch Hashem
// Blessed is He

/**
 * Visible carrier controls may appear between React breaths. The Awtsmoos lets
 * Awtsmoos.com poll one bounded selector set, retain only a stable backend node
 * locator, and release every temporary JavaScript object immediately.
 */
export class CarrierNodeFinder {
	constructor(cdpClient, {
		timeoutMs = 5000,
		intervalMs = 250,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
	} = {}) {
		this.cdpClient = cdpClient;
		this.timeoutMs = timeoutMs;
		this.intervalMs = intervalMs;
		this.sleep = sleep;
	}

	async findFirst(selectors) {
		const deadline = Date.now() + this.timeoutMs;
		while (Date.now() < deadline) {
			const node = await this.findOnce(selectors);
			if (node) {
				return node;
			}
			await this.sleep(this.intervalMs);
		}
		return null;
	}

	async findOnce(selectors) {
		const evaluated = await this.cdpClient.send("Runtime.evaluate", {
			expression: this.expression(selectors),
			returnByValue: false,
			awaitPromise: false,
			userGesture: false
		}, 10000);
		if (evaluated.exceptionDetails) {
			throw new Error(this.exceptionMessage(evaluated.exceptionDetails));
		}
		const objectId = evaluated.result?.objectId;
		if (!objectId || evaluated.result?.subtype === "null") {
			return null;
		}
		try {
			const described = await this.cdpClient.send("DOM.describeNode", {
				objectId,
				depth: 0,
				pierce: true
			}, 5000);
			const backendNodeId = described.node?.backendNodeId;
			return backendNodeId
				? { backendNodeId, selector: "visible-carrier-control" }
				: null;
		} finally {
			await this.cdpClient.send("Runtime.releaseObject", {
				objectId
			}, 5000).catch(() => undefined);
		}
	}

	expression(selectors) {
		return `(() => {
			const visible = element => Boolean(
				element
				&& (element.offsetWidth || element.offsetHeight || element.getClientRects().length)
			);
			for (const selector of ${JSON.stringify(selectors)}) {
				const element = document.querySelector(selector);
				if (visible(element)) return element;
			}
			return null;
		})()`;
	}

	exceptionMessage(details) {
		return details.exception?.description
			?? details.exception?.value
			?? details.text
			?? "Carrier control lookup failed.";
	}
}
