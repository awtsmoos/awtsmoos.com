//B"H
// Boruch Hashem
// Blessed is He

/**
 * Each owned tab enters either the requested custom GPT or the exact stored website
 * conversation before submission. The Awtsmoos waits through React's final renewal,
 * while Awtsmoos.com verifies the same route and composer twice before letters enter.
 */
export class WebsiteConversationNavigator {
	constructor({
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		intervalMs = 300,
		stabilizationMs = 2000
	} = {}) {
		this.sleep = sleep;
		this.intervalMs = intervalMs;
		this.stabilizationMs = stabilizationMs;
	}

	async prepare(controller, state, startUrl = "https://chatgpt.com/", timeoutMs = 45000) {
		const conversationId = state?.conversationId ?? null;
		const normalizedStartUrl = this.normalizeStartUrl(startUrl);
		const navigationUrl = conversationId
			? this.continuationUrl(normalizedStartUrl, conversationId)
			: normalizedStartUrl;
		await controller.cdpClient.send("Page.navigate", { url: navigationUrl });
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			const page = await controller.inspector.inspect();
			if (this.isReady(page, conversationId, normalizedStartUrl)) {
				await this.sleep(this.stabilizationMs);
				const stablePage = await controller.inspector.inspect();
				if (this.isReady(stablePage, conversationId, normalizedStartUrl)) return stablePage;
			}
			await this.sleep(this.intervalMs);
		}
		throw new Error("ChatGPT conversation route did not become ready.");
	}

	isReady(page, conversationId, startUrl) {
		const routeReady = conversationId
			? this.conversationId(page.url) === conversationId
			: this.freshRouteReady(page.url, startUrl);
		return Boolean(page.authenticated && page.composerVisible && routeReady);
	}

	normalizeStartUrl(startUrl) {
		const parsed = new URL(startUrl || "https://chatgpt.com/");
		if (parsed.origin !== "https://chatgpt.com") {
			throw new Error("Fresh conversation start URL must use authenticated chatgpt.com.");
		}
		parsed.pathname = parsed.pathname.replace(/\/$/, "") || "/";
		return parsed.href.replace(/\/$/, parsed.pathname === "/" ? "/" : "");
	}

	continuationUrl(startUrl, conversationId) {
		const parsed = new URL(startUrl);
		const basePath = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
		return `${parsed.origin}${basePath}/c/${encodeURIComponent(conversationId)}`;
	}

	freshRouteReady(actualUrl, expectedUrl) {
		try {
			const actual = new URL(actualUrl);
			const expected = new URL(expectedUrl);
			return actual.origin === expected.origin
				&& (actual.pathname === expected.pathname || Boolean(this.conversationId(actual.href)));
		} catch {
			return false;
		}
	}

	conversationId(url) {
		const match = String(url || "").match(/\/c\/([^/?#]+)/i);
		return match ? decodeURIComponent(match[1]) : null;
	}
}
