// B"H
// Boruch Hashem
// Blessed is He
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
	configuredAgentStartUrl,
	requireConfiguredAgentStartUrl
} = require("../../split-browser/config.cjs");

/**
 * @file Keeps one authenticated website turn inside its appointed GPT route.
 * @description
 * The Awtsmoos does not tear down a ready vessel merely to arrive where it already
 * stands. Awtsmoos.com inspects first, navigates only when the route differs, and
 * verifies the stable composer twice before any private letters enter.
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

	async prepare(controller, state, startUrl = configuredAgentStartUrl(), timeoutMs = 45000) {
		const conversationId = state?.conversationId ?? null;
		const normalizedStartUrl = this.normalizeStartUrl(startUrl);
		const navigationUrl = conversationId
			? this.continuationUrl(normalizedStartUrl, conversationId)
			: normalizedStartUrl;
		const currentPage = await this.safeInspect(controller);
		if (!this.isReady(currentPage, conversationId, normalizedStartUrl)) {
			await controller.cdpClient.send("Page.navigate", { url: navigationUrl });
		}
		return this.waitForStableRoute(
			controller,
			conversationId,
			normalizedStartUrl,
			timeoutMs
		);
	}

	async waitForStableRoute(controller, conversationId, startUrl, timeoutMs) {
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			const page = await this.safeInspect(controller);
			if (this.isReady(page, conversationId, startUrl)) {
				await this.sleep(this.stabilizationMs);
				const stablePage = await this.safeInspect(controller);
				if (this.isReady(stablePage, conversationId, startUrl)) {
					return stablePage;
				}
			}
			await this.sleep(this.intervalMs);
		}
		throw new Error("ChatGPT conversation route did not become ready.");
	}

	async safeInspect(controller) {
		try {
			return await controller.inspector.inspect();
		} catch {
			return null;
		}
	}

	isReady(page, conversationId, startUrl) {
		if (!page) return false;
		const routeReady = conversationId
			? this.continuationRouteReady(page.url, startUrl, conversationId)
			: this.freshRouteReady(page.url, startUrl);
		return Boolean(page.authenticated && page.composerVisible && routeReady);
	}

	normalizeStartUrl(startUrl) {
		return requireConfiguredAgentStartUrl(startUrl || configuredAgentStartUrl());
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
			return actual.origin === expected.origin &&
				this.normalizedPath(actual.pathname) === this.normalizedPath(expected.pathname);
		} catch {
			return false;
		}
	}

	continuationRouteReady(actualUrl, startUrl, conversationId) {
		try {
			const actual = new URL(actualUrl);
			const expected = new URL(this.continuationUrl(startUrl, conversationId));
			return actual.origin === expected.origin &&
				this.normalizedPath(actual.pathname) === this.normalizedPath(expected.pathname);
		} catch {
			return false;
		}
	}

	normalizedPath(value) {
		return String(value || "/").replace(/\/+$/, "") || "/";
	}

	conversationId(url) {
		const match = String(url || "").match(/\/c\/([^/?#]+)/i);
		return match ? decodeURIComponent(match[1]) : null;
	}
}
