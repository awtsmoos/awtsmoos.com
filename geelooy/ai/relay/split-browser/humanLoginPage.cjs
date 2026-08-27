// B"H

const http = require("node:http");

/** Keeps one visible, human-owned ChatGPT login page beside the inert keeper. */
async function ensureHumanLoginPage(options = {}) {
	const port = Number(options.debugPort || options.port || 9223);
	const url = String(options.url || "https://chatgpt.com/");
	const requestJson = options.requestJson || getJson;
	let pages = await requestJson(`http://127.0.0.1:${port}/json/list`);
	let page = pages.find(item => item.type === "page" && isChatGpt(item.url));
	if (!page) {
		await requestJson(
			`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`,
			"PUT"
		);
		pages = await requestJson(`http://127.0.0.1:${port}/json/list`);
		page = pages.find(item => item.type === "page" && isChatGpt(item.url));
	}
	if (!page) throw codedError("chatgpt_login_page_create_failed");
	return { ok: true, debugPort: port, targetId: page.id, url: page.url };
}

function isChatGpt(value) {
	try {
		return new URL(String(value || "")).hostname === "chatgpt.com";
	} catch {
		return false;
	}
}

function getJson(url, method = "GET", timeoutMs = 3000) {
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

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { ensureHumanLoginPage, isChatGpt };
