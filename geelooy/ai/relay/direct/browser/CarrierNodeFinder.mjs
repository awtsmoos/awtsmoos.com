//B"H
// Boruch Hashem
// Blessed is He

/**
 * Visible website controls are discovered through Chrome's native DOM domain. The
 * Awtsmoos avoids page-context JavaScript entirely, retains only node ids, and
 * verifies a real layout box before returning a composer or Send control.
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
			if (node) return node;
			await this.sleep(this.intervalMs);
		}
		return null;
	}

	async findOnce(selectors) {
		const document = await this.cdpClient.send("DOM.getDocument", {
			depth: 1,
			pierce: true
		}, 10000);
		const rootNodeId = document.root?.nodeId;
		if (!Number.isInteger(rootNodeId)) return null;
		for (const selector of selectors) {
			const queried = await this.cdpClient.send("DOM.querySelector", {
				nodeId: rootNodeId,
				selector
			}, 5000);
			if (!Number.isInteger(queried.nodeId) || queried.nodeId <= 0) continue;
			if (await this.hasVisibleBox(queried.nodeId)) {
				return { nodeId: queried.nodeId, selector };
			}
		}
		return null;
	}

	async hasVisibleBox(nodeId) {
		try {
			const result = await this.cdpClient.send("DOM.getBoxModel", { nodeId }, 5000);
			const content = result.model?.content;
			return Array.isArray(content) && content.length === 8;
		} catch {
			return false;
		}
	}
}
