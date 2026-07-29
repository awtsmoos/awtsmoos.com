//B"H
// Boruch Hashem
// Blessed is He

/**
 * Each owned tab enters either a fresh ChatGPT chat or the exact stored website
 * conversation before submission. The Awtsmoos never guesses continuity and never
 * touches unrelated user tabs in the authenticated profile.
 */
export class WebsiteConversationNavigator {
	constructor({
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		intervalMs = 300
	} = {}) {
		this.sleep = sleep;
		this.intervalMs = intervalMs;
	}

	async prepare(controller, state, timeoutMs = 45000) {
		const conversationId = state?.conversationId ?? null;
		const url = conversationId
			? `https://chatgpt.com/c/${encodeURIComponent(conversationId)}`
			: "https://chatgpt.com/";
		await controller.cdpClient.send("Page.navigate", { url });
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			const page = await controller.inspector.inspect();
			const currentId = this.conversationId(page.url);
			const routeReady = conversationId ? currentId === conversationId : !currentId;
			if (page.authenticated && page.composerVisible && routeReady) return page;
			await this.sleep(this.intervalMs);
		}
		throw new Error("ChatGPT conversation route did not become ready.");
	}

	conversationId(url) {
		const match = String(url || "").match(/\/c\/([^/?#]+)/i);
		return match ? decodeURIComponent(match[1]) : null;
	}
}
