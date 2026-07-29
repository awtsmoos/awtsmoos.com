// B"H
const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../../../../lib/config.js");

const ORIGINS = Object.freeze([
	"https://chatgpt.com",
	"https://openai.com",
	"https://auth.openai.com"
]);

/**
 * Explicit logout clears only ChatGPT/OpenAI site data through CDP. No cookie,
 * token, account identifier, or credential value is read into Node or returned.
 */
async function logout(input = {}) {
	const port = Number(
		input.port ||
		process.env.AWTSMOOS_CHROME_DEBUG_PORT ||
		9223
	);
	const target = await pageTarget(port);
	if (!target) {
		return {
			ok: false,
			action: "chatgptWebsiteLogout",
			error: "chatgpt_debug_browser_not_found",
			port
		};
	}
	const { createCdpClient } = require(loader(
		"ai/relay/split-browser/debugChromeWebSocket.cjs"
	));
	const client = await createCdpClient(target.webSocketDebuggerUrl);
	try {
		for (const origin of ORIGINS) {
			await client.send("Storage.clearDataForOrigin", {
				origin,
				storageTypes: "cookies,local_storage,session_storage,indexeddb,cache_storage,service_workers"
			}).catch(() => undefined);
		}
		await clearDirectState();
		return {
			ok: true,
			action: "chatgptWebsiteLogout",
			port,
			originsCleared: ORIGINS.length,
			credentialValuesRead: false,
			privateContinuationStateCleared: true,
			loginRequiredNextTurn: true
		};
	} finally {
		client.close();
	}
}

async function clearDirectState() {
	const direct = require(loader(
		"ai/relay/split-browser/directServiceLoader.cjs"
	));
	const service = await direct.loadDirectService();
	service.store?.clear?.();
	await direct.closeDirectService();
}

async function pageTarget(port) {
	const response = await fetch(`http://127.0.0.1:${port}/json/list`)
		.catch(() => null);
	if (!response?.ok) return null;
	const targets = await response.json();
	return targets.find(target =>
		target.type === "page" &&
		typeof target.webSocketDebuggerUrl === "string" &&
		String(target.url || "").includes("chatgpt.com")
	) || targets.find(target =>
		target.type === "page" &&
		typeof target.webSocketDebuggerUrl === "string"
	) || null;
}

function loader(relative) {
	const installed = path.join(ROOT, relative);
	if (fs.existsSync(installed)) return installed;
	return path.resolve(__dirname, "../../../../../../../", relative);
}

module.exports = { ORIGINS, logout, pageTarget };
