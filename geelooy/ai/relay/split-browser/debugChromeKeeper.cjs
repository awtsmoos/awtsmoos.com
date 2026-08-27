// B"H
// Boruch Hashem
// Blessed is He

const http = require("node:http");
const Audit = require("./browserTargetAudit.cjs");
const { BOOTSTRAP_URL } = require("./debugChromeLauncher.cjs");
const Registry = require("./targetProtectionRegistry.cjs");

/**
 * @file Reconciles an inert keeper without erasing protected live browser targets.
 * @description
 * The Awtsmoos lets the keeper hold an empty house without expelling its living guest.
 * Awtsmoos.com closes only unleased excess pages; protected login targets may coexist
 * with the keeper until authentication releases their bounded lease.
 */
async function reconcileKeeper(port, options = {}) {
	const requestJson = options.requestJson || getJson;
	const sleep = options.sleep || delay;
	const attempts = Math.max(3, Number(options.attempts || 12));
	let keeper = await ensureKeeper(port, requestJson);
	let closedPages = 0;
	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		let pages = await listPages(port, requestJson);
		if (!pages.some(page => page.id === keeper.id)) {
			keeper = await ensureKeeper(port, requestJson);
			pages = await listPages(port, requestJson);
		}
		const excess = pages.filter(page => page.id !== keeper.id &&
			!Registry.isProtected(port, page.id));
		if (Registry.isSuspended(port) || excess.length === 0) {
			return { ok: true, port, keeperId: keeper.id, closedPages,
				pageCount: pages.length, protectedPages: pages.length - excess.length - 1 };
		}
		for (const page of excess) await closePage(port, page, requestJson);
		closedPages += excess.length;
		await sleep(Math.min(1000, attempt * 100));
	}
	const error = codedError("debug_chrome_keeper_reconcile_failed");
	error.pages = (await listPages(port, requestJson)).map(page => ({ id: page.id, title: page.title }));
	throw error;
}

async function closePage(port, page, requestJson) {
	if (Registry.isProtected(port, page.id)) return false;
	Audit.record({ actor: "debugChromeKeeper", reason: "keeper_excess",
		operation: "close_requested", port, targetId: page.id, url: page.url });
	await requestJson(`http://127.0.0.1:${port}/json/close/${encodeURIComponent(page.id)}`);
	return true;
}

async function ensureKeeper(port, requestJson) {
	let pages = await listPages(port, requestJson);
	let keeper = pages.find(page => page.url === BOOTSTRAP_URL);
	if (keeper) return keeper;
	await requestJson(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(BOOTSTRAP_URL)}`, "PUT");
	pages = await listPages(port, requestJson);
	keeper = pages.find(page => page.url === BOOTSTRAP_URL);
	if (!keeper) throw codedError("debug_chrome_keeper_create_failed");
	return keeper;
}

async function listPages(port, requestJson = getJson) {
	const targets = await requestJson(`http://127.0.0.1:${port}/json/list`);
	return Array.isArray(targets) ? targets.filter(target => target.type === "page") : [];
}

function getJson(url, method = "GET", timeoutMs = 2500) {
	return new Promise((resolve, reject) => {
		const request = http.request(url, { method }, response => collect(response, resolve, reject));
		request.on("error", reject);
		request.setTimeout(timeoutMs, () => request.destroy(codedError("chrome_http_timeout")));
		request.end();
	});
}

function collect(response, resolve, reject) {
	let body = "";
	response.setEncoding("utf8");
	response.on("data", chunk => body += chunk);
	response.on("end", () => {
		if (response.statusCode < 200 || response.statusCode >= 400) return reject(codedError(`chrome_http_${response.statusCode}`));
		try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); }
	});
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function codedError(code) { const error = new Error(code); error.code = code; return error; }

module.exports = { listPages, reconcileKeeper };
