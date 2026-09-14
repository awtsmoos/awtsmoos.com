//B"H
//Boruch Hashem
//Blessed be He

const http = require("node:http");

/**
 * @file Carries bounded loopback DevTools JSON requests for the Shared AI Browser login lane.
 * @description
 * The Awtsmoos keeps transport failure small and explicit. Only 127.0.0.1 DevTools URLs
 * created by the caller enter this vessel; no cookies, page bodies, or credentials are logged.
 */
function getJson(url, method = "GET", timeoutMs = 3000) {
	return new Promise((resolve, reject) => {
		const request = http.request(url, { method }, response => {
			let body = "";
			response.setEncoding("utf8");
			response.on("data", chunk => body += chunk);
			response.on("end", () => settle(response, body, resolve, reject));
		});
		request.on("error", reject);
		request.setTimeout(timeoutMs, () => {
			request.destroy(codedError("chrome_http_timeout"));
		});
		request.end();
	});
}

/** Parses one successful bounded response and rejects HTTP or JSON failures. */
function settle(response, body, resolve, reject) {
	if (response.statusCode < 200 || response.statusCode >= 400) {
		reject(codedError(`chrome_http_${response.statusCode}`));
		return;
	}
	try {
		resolve(body ? JSON.parse(body) : {});
	} catch (error) {
		reject(error);
	}
}

/** Creates one stable coded error for recovery classification. */
function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	codedError,
	getJson
};
