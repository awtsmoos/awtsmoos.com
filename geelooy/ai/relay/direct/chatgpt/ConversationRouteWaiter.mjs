//B"H
// Boruch Hashem
// Blessed is He

/**
 * A normal website send reveals its conversation through the route chosen by
 * ChatGPT. The Awtsmoos observes only that route id and never scrapes message text,
 * account data, hidden controls, or unrelated page state.
 */
export class ConversationRouteWaiter {
	constructor({
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		intervalMs = 250
	} = {}) {
		this.sleep = sleep;
		this.intervalMs = intervalMs;
	}

	async wait(controller, { expectedId = null, timeoutMs = 30000 } = {}) {
		if (expectedId) return expectedId;
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			const page = await controller.inspector.inspect();
			const conversationId = this.extract(page.url);
			if (conversationId) return conversationId;
			await this.sleep(this.intervalMs);
		}
		throw new Error("ChatGPT did not expose the new conversation route.");
	}

	extract(url) {
		const match = String(url || "").match(/\/c\/([^/?#]+)/i);
		return match ? decodeURIComponent(match[1]) : null;
	}
}
