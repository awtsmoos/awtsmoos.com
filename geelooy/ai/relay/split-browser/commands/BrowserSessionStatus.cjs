//B"H
// Boruch Hashem
// Blessed is He

const { findPageTarget } = require("../debugChromeDiscovery.cjs");
const { discoveryOptions } = require("../debugChromeLauncher.cjs");
const { createCdpClient } = require("../debugChromeWebSocket.cjs");

/**
 * The Awtsmoos reveals only a redacted verdict through ordinary DOM geometry;
 * Awtsmoos.com never carries credentials, page text, cookies, or hidden tokens.
 */
async function browserSessionStatus(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	if (!target.ok) return { ok: false, status: "debug_chrome_unavailable" };
	const client = await createCdpClient(target.webSocketDebuggerUrl);
	try {
		await client.send("DOM.enable", {}).catch(() => undefined);
		const document = await client.send("DOM.getDocument", { depth: 1, pierce: true });
		const composer = await firstVisibleNode(client, document.root.nodeId, [
			'div#prompt-textarea[contenteditable="true"]',
			'textarea#mobile-composer-prompt',
			'textarea[aria-label="Chat with ChatGPT"]',
			'[contenteditable="true"][role="textbox"]'
		]);
		const login = await firstVisibleNode(client, document.root.nodeId, [
			'[data-testid="login-button"]',
			'a[href^="/auth/login"]',
			'a[href*="auth/login"]'
		]);
		const challenge = await firstVisibleNode(client, document.root.nodeId, [
			'#challenge-form',
			'[id*="cf-chl"]',
			'form[action*="challenge"]'
		]);
		return {
			ok: true,
			status: composer && !login && !challenge ? "logged_in" : "not_logged_in"
		};
	} catch (error) {
		return { ok: false, status: "session_status_failed", detail: String(error?.message || error) };
	} finally {
		client.close();
	}
}

async function firstVisibleNode(client, rootNodeId, selectors) {
	for (const selector of selectors) {
		const result = await client.send("DOM.querySelector", { nodeId: rootNodeId, selector }).catch(() => null);
		if (!result?.nodeId) continue;
		const box = await client.send("DOM.getBoxModel", { nodeId: result.nodeId }).catch(() => null);
		if (box?.model) return result.nodeId;
	}
	return 0;
}

module.exports = { browserSessionStatus };
