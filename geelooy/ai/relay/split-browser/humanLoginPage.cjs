//B"H
//Boruch Hashem
//Blessed be He

const Http = require("./loginTargetHttp.cjs");
const Config = require("./config.cjs");
const Navigator = require("./loginTargetNavigator.cjs");

/**
 * @file Restores one exact, visible, human-owned Awtsmoos Shliach login sentinel.
 * @description
 * The Awtsmoos distinguishes a living Chrome process from the Shliach doorway inside it.
 * Existing unrelated ChatGPT pages are ignored, while an owned blank target is reconciled,
 * navigated, activated, and verified before higher layers call the shared browser ready.
 */
async function ensureHumanLoginPage(options = {}) {
	const port = requiredPort(options);
	const url = Config.requireConfiguredAgentStartUrl(
		options.url || Config.configuredAgentStartUrl()
	);
	const requestJson = options.requestJson || Http.getJson;
	const navigateTarget = options.navigateTarget || Navigator.navigateTarget;
	let pages = await requestJson(listUrl(port));
	let page = pages.find(item => isShliach(item.url, url));
	if (page) {
		await activate(requestJson, port, page.id);
		return result(port, page, false);
	}
	const baseline = new Set(pages.map(item => item.id));
	page = await createOwnedBlank(requestJson, port, baseline);
	try {
		await navigateTarget(page, url, Number(options.navigationTimeoutMs || 10000));
		page = await waitForShliach(requestJson, port, page.id, url, options);
		await activate(requestJson, port, page.id);
		return result(port, page, true);
	} catch (error) {
		await closeOwned(requestJson, port, page.id);
		throw error;
	}
}

/** Requires explicit browser authority so login repair can never guess another Chrome. */
function requiredPort(options = {}) {
	const port = Number(options.debugPort || options.port);
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw Http.codedError("shared_ai_browser_port_required");
	}
	return port;
}

/** Creates one owned blank target and reconciles a timed-out creation response by target ID. */
async function createOwnedBlank(requestJson, port, baseline) {
	try {
		return await requestJson(`${newUrl(port)}${encodeURIComponent("about:blank")}`, "PUT");
	} catch (error) {
		const pages = await requestJson(listUrl(port));
		const created = pages.filter(item => !baseline.has(item.id) && isBlank(item));
		if (created.length === 1) return created[0];
		throw error;
	}
}

/** Waits until the exact owned target visibly reports the canonical Shliach route. */
async function waitForShliach(requestJson, port, targetId, url, options = {}) {
	const timeoutMs = Math.max(1000, Number(options.verifyTimeoutMs || 15000));
	const pollMs = Math.max(50, Number(options.pollMs || 150));
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const pages = await requestJson(listUrl(port));
		const page = pages.find(item => item.id === targetId);
		if (page && isShliach(page.url, url)) return page;
		await new Promise(resolve => setTimeout(resolve, pollMs));
	}
	throw Http.codedError("chatgpt_shliach_page_verify_timeout");
}

/** Matches only the configured Awtsmoos Shliach route or one of its conversation routes. */
function isShliach(value, targetUrl = Config.configuredAgentStartUrl()) {
	try {
		const actual = new URL(String(value || ""));
		const target = new URL(Config.requireConfiguredAgentStartUrl(targetUrl));
		const base = target.pathname.replace(/\/+$/, "");
		return actual.origin === target.origin &&
			(actual.pathname === base || actual.pathname.startsWith(`${base}/c/`));
	} catch {
		return false;
	}
}

function isBlank(item = {}) {
	return item.type === "page" && ["about:blank", "chrome://newtab/"].includes(String(item.url || ""));
}

async function activate(requestJson, port, targetId) {
	await requestJson(`http://127.0.0.1:${port}/json/activate/${encodeURIComponent(targetId)}`).catch(() => null);
}

async function closeOwned(requestJson, port, targetId) {
	await requestJson(`http://127.0.0.1:${port}/json/close/${encodeURIComponent(targetId)}`).catch(() => null);
}

function result(port, page, opened) {
	return { ok: true, opened, debugPort: port, targetId: page.id, url: page.url };
}

function listUrl(port) { return `http://127.0.0.1:${port}/json/list`; }
function newUrl(port) { return `http://127.0.0.1:${port}/json/new?`; }

module.exports = {
	ensureHumanLoginPage,
	isShliach
};
