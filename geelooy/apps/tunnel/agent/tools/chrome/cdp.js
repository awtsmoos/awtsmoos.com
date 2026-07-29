// B"H
// Boruch Hashem
// Blessed is He

const http = require("node:http");
const { TinyWebSocket } = require("../../lib/ws.js");
const { captureCdpEvent } = require("./logs.js");

let pageWs = null;
let pagePort = null;
let nextId = 1;
let lastPageId = "";

const callbacks = new Map();
const targetLeases = new Map();
const MAX_HTTP_BYTES = Number(
	process.env.AWTSMOOS_CDP_HTTP_MAX_BYTES || 2 * 1024 * 1024
);

/**
 * @file cdp.js
 * @description Owns target-aware Chrome DevTools HTTP, socket, reconnect, and lease state.
 * The Awtsmoos is beyond every finite socket; Awtsmoos.com reconnects the exact
 * leased page after a bridge interruption without letting a retired socket reject
 * commands that already belong to its renewed successor.
 */
function maxTimeout() {
	const number = Number(
		process.env.AWTSMOOS_CDP_MAX_TIMEOUT_MS || 86400000
	);
	return Number.isFinite(number)
		? Math.max(10000, Math.min(number, 604800000))
		: 86400000;
}

function timeoutOf(value, fallback = 30000) {
	const number = Number(value || fallback);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(Math.floor(number), maxTimeout()))
		: fallback;
}

function methodOf(url) {
	return /\/json\/new(?:\?|$)/.test(url)
		|| /\/json\/close\//.test(url)
		? "PUT"
		: "GET";
}

function getJson(url, timeoutMs = 30000) {
	return new Promise((resolve, reject) => {
		const request = http.request(url, { method: methodOf(url) }, response => {
			const chunks = [];
			let bytes = 0;
			response.on("data", chunk => {
				bytes += chunk.length;
				if (bytes > MAX_HTTP_BYTES) {
					request.destroy(new Error(
						`Chrome DevTools HTTP response too large for ${url}`
					));
					return;
				}
				chunks.push(chunk);
			});
			response.on(
				"end",
				() => parseJson(resolve, reject, url, chunks)
			);
		});
		request.setTimeout(
			timeoutOf(timeoutMs),
			() => request.destroy(new Error(`HTTP timeout for ${url}`))
		);
		request.on("error", reject);
		request.end();
	});
}

function parseJson(resolve, reject, url, chunks) {
	const text = Buffer.concat(chunks).toString("utf8");
	try {
		resolve(JSON.parse(text));
	} catch {
		if (/^Target/.test(text) || text === "true") {
			resolve({ ok: true, text });
			return;
		}
		reject(new Error(`Bad JSON from ${url}: ${text.slice(0, 200)}`));
	}
}

async function version(port) {
	return getJson(`http://127.0.0.1:${port}/json/version`);
}

async function pages(port) {
	return getJson(`http://127.0.0.1:${port}/json`);
}

async function newPage(port, url = "about:blank") {
	return getJson(
		`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`
	);
}

async function closePage(port, targetId) {
	return getJson(
		`http://127.0.0.1:${port}/json/close/${encodeURIComponent(targetId)}`
	);
}

function wireSocket(socket) {
	socket.on("message", message => {
		let data;
		try {
			data = JSON.parse(message);
		} catch {
			return;
		}
		if (data.id && callbacks.has(data.id)) {
			resolveCallback(data);
			return;
		}
		if (data.method) captureCdpEvent(data);
	});
	socket.once("close", () => retireSocket(
		socket,
		"Chrome DevTools socket closed."
	));
	socket.once("error", error => retireSocket(
		socket,
		error?.message || "Chrome DevTools socket error."
	));
}

function retireSocket(socket, message) {
	if (pageWs !== socket) return;
	pageWs = null;
	rejectAll(message);
}

function resolveCallback(data) {
	const callback = callbacks.get(data.id);
	callbacks.delete(data.id);
	callback.clear?.();
	if (data.error) {
		callback.reject(new Error(JSON.stringify(data.error)));
		return;
	}
	callback.resolve(data.result);
}

function closeCurrent(message = "Chrome DevTools socket replaced.") {
	const current = pageWs;
	pageWs = null;
	pagePort = null;
	try {
		current?.close?.(true);
	} catch {}
	rejectAll(message);
}

function dropCurrentSocket() {
	const current = pageWs;
	if (!current) return false;
	try {
		current.close(true);
	} catch {
		retireSocket(current, "Chrome DevTools socket dropped.");
	}
	return true;
}

function rejectAll(message) {
	for (const callback of callbacks.values()) {
		callback.clear?.();
		callback.reject(new Error(message));
	}
	callbacks.clear();
}

async function connectPageWs(port, page, timeoutMs = 30000) {
	const socket = new TinyWebSocket(page.webSocketDebuggerUrl);
	wireSocket(socket);
	await new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			try {
				socket.close(true);
			} catch {}
			reject(new Error("DevTools websocket open timeout."));
		}, timeoutOf(timeoutMs));
		timer.unref?.();
		socket.once("open", () => {
			clearTimeout(timer);
			resolve();
		});
		socket.once("error", error => {
			clearTimeout(timer);
			reject(error);
		});
		socket.connect();
	});
	pageWs = socket;
	pagePort = Number(port);
	lastPageId = page.id || "";
	await enableDomains();
	return pageWs;
}

async function enableDomains() {
	await Promise.allSettled([
		"Runtime.enable",
		"Page.enable",
		"DOM.enable",
		"Log.enable",
		"Network.enable"
	].map(method => cdpCall(
		method,
		{},
		2500,
		{ noReconnect: true }
	)));
}

async function ensurePage(port = 9222, options = {}) {
	const requestedPort = Number(port || 9222);
	if (
		pageWs?.opened
		&& pagePort === requestedPort
		&& !options.forceReconnect
		&& targetOk(options)
	) {
		return pageWs;
	}
	if (pageWs) closeCurrent("Chrome DevTools reconnect requested.");
	const list = await pageList(requestedPort);
	const preferred = choosePage(list, options);
	if (preferred) {
		leaseTarget(preferred.id, options);
		return connectPageWs(requestedPort, preferred, options.timeoutMs);
	}
	const explicitTarget = options.chromeTargetId
		|| options.pageId
		|| options.targetId;
	if (explicitTarget) {
		throw new Error(
			`Chrome target unavailable or lease mismatch: ${explicitTarget}`
		);
	}
	const page = await newPage(
		requestedPort,
		options.url || "about:blank"
	);
	if (!page.webSocketDebuggerUrl) {
		throw new Error("No page websocket found.");
	}
	leaseTarget(page.id, options);
	return connectPageWs(requestedPort, page, options.timeoutMs);
}

function targetOk(options) {
	return (!options.pageId || options.pageId === lastPageId)
		&& (
			!options.chromeTargetId
			|| options.chromeTargetId === lastPageId
		)
		&& canUseTarget(lastPageId, options);
}

async function pageList(port) {
	try {
		return await pages(port);
	} catch (error) {
		throw new Error(
			`Chrome DevTools not reachable on port ${port}: ${error.message}`
		);
	}
}

function choosePage(list, options = {}) {
	const available = list.filter(page => (
		page.type === "page" && page.webSocketDebuggerUrl
	));
	const id = options.chromeTargetId
		|| options.pageId
		|| options.targetId;
	if (id) {
		return available.find(page => (
			page.id === id && canUseTarget(page.id, options)
		)) || null;
	}
	const scopeKey = targetScopeKey(options);
	if (scopeKey) {
		const owned = available.find(page => (
			targetLeases.get(page.id)?.scopeKey === scopeKey
		));
		if (owned) return owned;
	}
	if (options.preferUrl) {
		const matched = available.find(page => (
			String(page.url || "").startsWith(String(options.preferUrl))
		));
		if (matched && canUseTarget(matched.id, options)) return matched;
	}
	if (lastPageId) {
		const same = available.find(page => (
			page.id === lastPageId && canUseTarget(page.id, options)
		));
		if (same) return same;
	}
	return sortPageCandidates(
		available.filter(page => canUseTarget(page.id, options))
	)[0] || null;
}

function sortPageCandidates(list) {
	return [...list].sort(
		(left, right) => pageScore(right) - pageScore(left)
	);
}

function pageScore(page = {}) {
	const url = String(page.url || "");
	const title = String(page.title || "");
	if (/chatgpt\.com/i.test(url)) return 100;
	if (/chatgpt/i.test(title)) return 90;
	if (/^https?:\/\//i.test(url)) return 40;
	if (/^about:blank/i.test(url)) return 5;
	if (/^data:/i.test(url)) return 1;
	return 10;
}

async function cdpCall(method, params = {}, timeoutMs = 30000, options = {}) {
	if (!pageWs?.opened) {
		if (options.noReconnect || !pagePort) {
			throw new Error("Page DevTools socket is not connected.");
		}
		await reconnectCurrent(timeoutMs);
	}
	try {
		return await rawCdpCall(method, params, timeoutMs);
	} catch (error) {
		if (options.noReconnect || !isSocketFailure(error)) throw error;
		await reconnectCurrent(timeoutMs);
		return rawCdpCall(method, params, timeoutMs);
	}
}

async function reconnectCurrent(timeoutMs) {
	const port = pagePort;
	const targetId = lastPageId;
	if (!port) throw new Error("Chrome DevTools reconnect has no known port.");
	await ensurePage(port, {
		forceReconnect: true,
		force: true,
		chromeTargetId: targetId,
		timeoutMs
	});
}

function rawCdpCall(method, params = {}, timeoutMs = 30000) {
	const id = nextId++;
	return new Promise((resolve, reject) => {
		const limit = timeoutOf(timeoutMs);
		const timer = setTimeout(() => {
			if (!callbacks.has(id)) return;
			callbacks.delete(id);
			reject(new Error(
				`CDP timeout for ${method} after ${limit}ms`
			));
		}, limit);
		timer.unref?.();
		callbacks.set(id, {
			resolve,
			reject,
			clear: () => clearTimeout(timer)
		});
		try {
			pageWs.sendJson({ id, method, params });
		} catch (error) {
			callbacks.delete(id);
			clearTimeout(timer);
			reject(error);
		}
	});
}

function isSocketFailure(error) {
	return /socket|websocket|closed|not connected|replaced/i.test(
		String(error?.message || error)
	);
}

async function navigateAndWait(
	url,
	timeoutMs = 30000,
	port = 9222,
	options = {}
) {
	const limit = timeoutOf(timeoutMs);
	const startedAt = Date.now();
	await ensurePage(port, {
		...options,
		forceReconnect: true,
		url,
		preferUrl: url,
		timeoutMs: Math.min(limit, 15000)
	});
	let navigation = await safeNavigate(url, limit);
	let ready = navigation.ok
		? await waitReady(startedAt, limit, url)
		: navigation;
	if (ready.ok && !looksNavigated(ready.href, url)) {
		ready = await freshTargetNavigate(
			url,
			limit,
			port,
			options,
			startedAt,
			ready
		);
	}
	return ready;
}

async function safeNavigate(url, limit) {
	try {
		await cdpCall(
			"Page.navigate",
			{ url },
			Math.min(limit, 30000)
		);
		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			readyState: "navigate_error",
			error: error.message,
			durationMs: 0
		};
	}
}

async function freshTargetNavigate(
	url,
	limit,
	port,
	options,
	startedAt,
	previous
) {
	closeCurrent("navigation stuck on old target");
	const page = await newPage(port, url);
	await connectPageWs(port, page, Math.min(limit, 15000));
	leaseTarget(page.id, options);
	await safeNavigate(url, limit);
	const ready = await waitReady(startedAt, limit, url);
	return {
		...ready,
		retriedFreshTarget: true,
		previous
	};
}

async function waitReady(startedAt, limit, expectedUrl = "") {
	while (Date.now() - startedAt < limit) {
		try {
			const result = await cdpCall("Runtime.evaluate", {
				expression: "({readyState:document.readyState,href:location.href,title:document.title})",
				returnByValue: true
			}, 5000);
			const value = result.result?.value || {};
			if (
				["complete", "interactive"].includes(value.readyState)
				&& looksNavigated(value.href, expectedUrl)
			) {
				return {
					ok: true,
					readyState: value.readyState,
					href: value.href,
					title: value.title || "",
					chromeTargetId: lastPageId,
					durationMs: Date.now() - startedAt
				};
			}
		} catch (error) {
			if (!isSocketFailure(error)) {
				return {
					ok: false,
					readyState: "eval_error",
					error: error.message,
					durationMs: Date.now() - startedAt
				};
			}
		}
		await new Promise(resolve => setTimeout(resolve, 250));
	}
	return {
		ok: false,
		readyState: "timeout",
		href: await currentHref().catch(() => ""),
		chromeTargetId: lastPageId,
		durationMs: Date.now() - startedAt,
		timeoutMs: limit
	};
}

function looksNavigated(href = "", expected = "") {
	if (!expected || expected === "about:blank") return Boolean(href);
	if (/^about:blank/i.test(String(href))) return false;
	try {
		return new URL(href).origin === new URL(expected).origin
			|| String(href).startsWith(
				String(expected).replace(/[#?].*$/, "")
			);
	} catch {
		return String(href || "") !== "about:blank";
	}
}

async function currentHref() {
	const result = await cdpCall("Runtime.evaluate", {
		expression: "location.href",
		returnByValue: true
	}, 3000);
	return result.result?.value || "";
}

function targetScopeKey(input = {}) {
	return [
		input.browserSessionId,
		input.roomId,
		input.missionId,
		input.agentSessionId,
		input.logicalAgentId
	].filter(Boolean).join("::");
}

function leaseTarget(targetId, input = {}) {
	if (!targetId) return null;
	const scopeKey = targetScopeKey(input);
	if (!scopeKey && !input.shared) {
		return targetLeases.get(targetId) || null;
	}
	const lease = {
		targetId,
		scopeKey,
		browserSessionId: input.browserSessionId || "",
		roomId: input.roomId || "",
		missionId: input.missionId || "",
		agentSessionId: input.agentSessionId || "",
		logicalAgentId: input.logicalAgentId || "",
		shared: input.shared === true,
		leasedAt: new Date().toISOString()
	};
	targetLeases.set(targetId, lease);
	return lease;
}

function canUseTarget(targetId, input = {}) {
	const lease = targetLeases.get(targetId);
	if (
		!lease
		|| lease.shared
		|| input.force === true
		|| input.inspectShared === true
	) {
		return true;
	}
	const scopeKey = targetScopeKey(input);
	return Boolean(scopeKey && lease.scopeKey === scopeKey);
}

function targetLease(targetId) {
	return targetLeases.get(targetId) || null;
}

function releaseTarget(targetId) {
	return targetLeases.delete(targetId);
}

function targetLeaseSnapshot() {
	return Object.fromEntries(targetLeases.entries());
}

module.exports = {
	canUseTarget,
	cdpCall,
	choosePage,
	closeCurrent,
	closePage,
	connectPageWs,
	currentHref,
	dropCurrentSocket,
	ensurePage,
	isSocketFailure,
	leaseTarget,
	looksNavigated,
	methodOf,
	navigateAndWait,
	newPage,
	pageScore,
	pages,
	rawCdpCall,
	reconnectCurrent,
	releaseTarget,
	sortPageCandidates,
	targetLease,
	targetLeaseSnapshot,
	targetScopeKey,
	timeoutOf,
	version
};
