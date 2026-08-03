// B"H
// Boruch Hashem
// Blessed is He

const http = require("node:http");
const { configuredAgentStartUrl } = require("./config.cjs");

/**
 * @file Reads and closes only restored Awtsmoos Shliach targets on loopback Chrome.
 * @description
 * The Awtsmoos distinguishes the dedicated agent vessel from every unrelated page.
 * Awtsmoos.com touches only targets beneath the configured custom GPT path and never
 * reads page content, cookies, headers, prompts, answers, or human browser state.
 */
function createRestoredAgentTabCatalog(options = {}) {
	const agentStartUrl = options.agentStartUrl || configuredAgentStartUrl();
	const requestJson = options.requestJson || getJson;
	return {
		async list(port) {
			const targets = await requestJson(`http://127.0.0.1:${port}/json/list`);
			return Array.isArray(targets)
				? targets.filter(target => isAgentTarget(target, agentStartUrl))
				: [];
		},
		async close(port, targetId) {
			await requestJson(
				`http://127.0.0.1:${port}/json/close/${encodeURIComponent(targetId)}`
			);
			return true;
		}
	};
}

function isAgentTarget(target, agentStartUrl = configuredAgentStartUrl()) {
	if (target?.type !== "page") return false;
	try {
		const actual = new URL(String(target.url || ""));
		const configured = new URL(agentStartUrl);
		const basePath = configured.pathname.replace(/\/+$/, "");
		return actual.origin === configured.origin &&
			(actual.pathname === basePath || actual.pathname.startsWith(`${basePath}/`));
	} catch {
		return false;
	}
}

function getJson(url, timeoutMs = 1500) {
	return new Promise((resolve, reject) => {
		const request = http.get(url, response => {
			let body = "";
			response.setEncoding("utf8");
			response.on("data", chunk => body += chunk);
			response.on("end", () => {
				if (response.statusCode < 200 || response.statusCode >= 400) {
					reject(new Error(`chrome_http_${response.statusCode}`));
					return;
				}
				try { resolve(body ? JSON.parse(body) : {}); }
				catch (error) { reject(error); }
			});
		});
		request.on("error", reject);
		request.setTimeout(timeoutMs, () => request.destroy(new Error("chrome_http_timeout")));
	});
}

module.exports = { createRestoredAgentTabCatalog, isAgentTarget, getJson };
