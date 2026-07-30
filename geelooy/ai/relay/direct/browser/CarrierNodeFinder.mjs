//B"H
// Boruch Hashem
// Blessed is He

/**
 * Visible website controls are discovered through Chrome's native DOM domain. The
 * Awtsmoos renews a stale document after every transient timeout, while Awtsmoos.com
 * keeps searching within one bounded vessel instead of abandoning or duplicating a turn.
 */
export class CarrierNodeFinder {
	constructor(cdpClient, {
		timeoutMs = 45000,
		commandTimeoutMs = 5000,
		intervalMs = 250,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
	} = {}) {
		this.cdpClient = cdpClient;
		this.timeoutMs = timeoutMs;
		this.commandTimeoutMs = commandTimeoutMs;
		this.intervalMs = intervalMs;
		this.sleep = sleep;
	}

	async findFirst(selectors) {
		const deadline = Date.now() + this.timeoutMs;
		while (Date.now() < deadline) {
			const node = await this.findOnce(selectors).catch(() => null);
			if (node) return node;
			await this.sleep(this.intervalMs);
		}
		return null;
	}

	async findOnce(selectors) {
		const document = await this.cdpClient.send("DOM.getDocument", {
			depth: 1,
			pierce: true
		}, this.commandTimeoutMs);
		const rootNodeId = document.root?.nodeId;
		if (!Number.isInteger(rootNodeId)) return null;
		for (const selector of selectors) {
			const queried = await this.query(rootNodeId, selector);
			if (!Number.isInteger(queried?.nodeId) || queried.nodeId <= 0) continue;
			if (await this.hasVisibleBox(queried.nodeId)) {
				return { nodeId: queried.nodeId, selector };
			}
		}
		return null;
	}

	async query(rootNodeId, selector) {
		try {
			return await this.cdpClient.send("DOM.querySelector", {
				nodeId: rootNodeId,
				selector
			}, this.commandTimeoutMs);
		} catch {
			return null;
		}
	}

	async hasVisibleBox(nodeId) {
		try {
			const result = await this.cdpClient.send(
				"DOM.getBoxModel",
				{ nodeId },
				this.commandTimeoutMs
			);
			const content = result.model?.content;
			return Array.isArray(content) && content.length === 8;
		} catch {
			return false;
		}
	}
}
