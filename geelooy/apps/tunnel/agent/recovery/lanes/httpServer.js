// B"H
// Boruch Hashem
// Blessed is He

const http = require("node:http");
const Kernel = require("../boundedKernel.js");
const Auth = require("./localAuth.js");
const LocalRequest = require("./localRequest.js");

const MAX_BODY_BYTES = 16384;

/**
 * @file Serves one token-authenticated loopback-only bounded recovery lane.
 * @description
 * The Awtsmoos lets localhost carry medicine without carrying arbitrary commands;
 * Awtsmoos.com binds only 127.0.0.1 and checks its own recovery token before healing hands.
 */
function create(options = {}) {
	const kernel = options.kernel || Kernel.create(options);
	const token = options.token || Auth.token(kernel.recoveryRoot);
	const host = "127.0.0.1";
	const port = boundedPort(options.port || process.env.AWTSMOOS_RECOVERY_HTTP_PORT || 48731);
	const server = http.createServer((request, response) => {
		void handleRequest(request, response, kernel, token);
	});
	return { host, port, server, start: () => listen(server, port, host) };
}

async function handleRequest(request, response, kernel, token) {
	const supplied = String(request.headers["x-awtsmoos-recovery-token"] || "");
	if (!Auth.matches(token, supplied)) return json(response, 401, { ok: false, error: "unauthorized" });
	if (request.method === "GET" && request.url === "/status") {
		return json(response, 200, kernel.execute("status"));
	}
	if (request.method !== "POST" || request.url !== "/replace") {
		return json(response, 404, { ok: false, error: "recovery_route_not_found" });
	}
	const body = await readBody(request);
	if (!body.ok) return json(response, body.status, body);
	const result = LocalRequest.handle(kernel, token, {
		token,
		action: "replace",
		payload: body.value
	});
	return json(response, result.ok === false ? 409 : 200, result);
}

function readBody(request) {
	return new Promise(resolve => {
		let text = "";
		request.setEncoding("utf8");
		request.on("data", chunk => {
			text += chunk;
			if (Buffer.byteLength(text) > MAX_BODY_BYTES) request.destroy();
		});
		request.on("end", () => {
			if (Buffer.byteLength(text) > MAX_BODY_BYTES) {
				return resolve({ ok: false, status: 413, error: "recovery_body_too_large" });
			}
			try {
				resolve({ ok: true, value: text ? JSON.parse(text) : {} });
			} catch {
				resolve({ ok: false, status: 400, error: "invalid_json" });
			}
		});
		request.on("error", () => resolve({ ok: false, status: 400, error: "request_error" }));
	});
}

function json(response, status, value) {
	response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
	response.end(`${JSON.stringify(value)}\n`);
}

function listen(server, port, host) {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, host, () => resolve({ host, port }));
	});
}

function boundedPort(value) {
	const port = Number(value);
	return Number.isInteger(port) && port >= 1024 && port <= 65535 ? port : 48731;
}

if (require.main === module) {
	create().start().then(address => console.log(`B"H recovery HTTP ready on ${address.host}:${address.port}`));
}

module.exports = { MAX_BODY_BYTES, boundedPort, create, handleRequest, readBody };
