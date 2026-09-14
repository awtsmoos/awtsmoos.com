//B"H
//Boruch Hashem
//Blessed be He

const { requireSplitBrowser } = require("../../../lib/split-browser-require.js");
const Shliach = require("./shliachTarget.js");

const LoginPage = requireSplitBrowser("humanLoginPage.cjs");

/**
 * @file Reports whether the selected Shared AI Browser visibly contains Awtsmoos Shliach.
 * @description
 * Browser-process readiness, Shliach presence, and ChatGPT authentication are separate truths.
 * Only safe target counts and route booleans leave this module; page content stays inside Chrome.
 */
async function readShliachPageStatus(port, options = {}) {
	const requestJson = options.requestJson || defaultRequest;
	if (!Number.isInteger(Number(port)) || Number(port) < 1) {
		return empty("browser_unavailable");
	}
	try {
		const pages = await requestJson(`http://127.0.0.1:${Number(port)}/json/list`);
		const shliachPages = pages.filter(item =>
			item.type === "page" && LoginPage.isShliach(item.url, Shliach.url())
		);
		return {
			known: true,
			shliachOpen: shliachPages.length > 0,
			conversationOpen: shliachPages.some(item => /\/c\//.test(String(item.url || ""))),
			shliachPageCount: shliachPages.length,
			pageCount: pages.filter(item => item.type === "page").length
		};
	} catch (error) {
		return empty(String(error?.message || "target_status_unavailable").slice(0, 120));
	}
}

/** Performs one bounded loopback read without following arbitrary remote URLs. */
async function defaultRequest(url) {
	const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
	if (!response.ok) throw new Error(`chrome_http_${response.status}`);
	return response.json();
}

/** Returns an explicit unknown target state rather than assuming readiness. */
function empty(error) {
	return {
		known: false,
		shliachOpen: false,
		conversationOpen: false,
		shliachPageCount: 0,
		pageCount: 0,
		error
	};
}

module.exports = { readShliachPageStatus };
