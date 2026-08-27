// B"H
// Boruch Hashem
// Blessed is He

const http = require("node:http");
const { BOOTSTRAP_URL } = require("./debugChromeLauncher.cjs");

/**
 * @file Leaves exactly one non-agent keeper page after verified target disappearance.
 * @description
 * The Awtsmoos distinguishes a close acknowledgment from a vanished target. Awtsmoos.com
 * retries and polls the dedicated profile until one inert data keeper is the only page,
 * never about:blank, before any agent target may be created.
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
		const excess = pages.filter(page => page.id !== keeper.id);
		if (!excess.length && pages.length === 1 && pages[0].url === BOOTSTRAP_URL) {
			return { ok: true, port, keeperId: keeper.id, closedPages, pageCount: 1 };
		}
		await Promise.allSettled(excess.map(page => requestJson(
			`http://127.0.0.1:${port}/json/close/${encodeURIComponent(page.id)}`
		)));
		closedPages += excess.length;
		await sleep(Math.min(1000, attempt * 100));
	}
	const finalPages = await listPages(port, requestJson);
	const error = codedError("debug_chrome_keeper_reconcile_failed");
	error.pages = finalPages.map(page => ({ id: page.id, title: page.title, url: page.url }));
	throw error;
}

async function ensureKeeper(port, requestJson) {
	let pages = await listPages(port, requestJson);
	let keeper = pages.find(page => page.url === BOOTSTRAP_URL);
	if (keeper) return keeper;
	await requestJson(
		`http://127.0.0.1:${port}/json/new?${encodeURIComponent(BOOTSTRAP_URL)}`,
		"PUT"
	);
	pages = await listPages(port, requestJson);
	keeper = pages.find(page => page.url === BOOTSTRAP_URL);
	if (!keeper) throw codedError("debug_chrome_keeper_create_failed");
	return keeper;
}

async function listPages(port, requestJson = getJson) {
	const targets = await requestJson(`http://127.0.0.1:${port}/json/list`);
	return Array.isArray(targets)
		? targets.filter(target => target.type === "page")
		: [];
}

function getJson(url, method = "GET", timeoutMs = 2500) {
	return new Promise((resolve, reject) => {
		const request = http.request(url, { method }, response => {
			let body = "";
			response.setEncoding("utf8");
			response.on("data", chunk => body += chunk);
			response.on("end", () => {
				if (response.statusCode < 200 || response.statusCode >= 400) {
					reject(codedError(`chrome_http_${response.statusCode}`));
					return;
				}
				try { resolve(body ? JSON.parse(body) : {}); }
				catch (error) { reject(error); }
			});
		});
		request.on("error", reject);
		request.setTimeout(timeoutMs, () => request.destroy(codedError("chrome_http_timeout")));
		request.end();
	});
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { listPages, reconcileKeeper };
