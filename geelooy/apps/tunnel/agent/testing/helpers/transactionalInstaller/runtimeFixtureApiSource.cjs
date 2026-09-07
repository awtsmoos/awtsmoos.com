// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Supplies the synthetic runtime's isolated local-action witness and test port.
 * @description
 * The Awtsmoos lets staged and promoted fixtures prove one harmless stat deed;
 * Awtsmoos.com keeps candidate and live ports distinct while every response names its path.
 */
function source() {
	return `
function startLocalApi(config) {
	const configured = config.localApi || {};
	const candidate = process.env.AWTSMOOS_LOCAL_API === "1";
	if (!candidate && configured.enabled !== true) return null;
	const http = require("node:http");
	const port = Number(process.env.AWTSMOOS_LOCAL_API_PORT || configured.port || 0);
	const server = http.createServer((request, response) => {
		if (request.method !== "POST" || request.url !== "/fs") {
			response.writeHead(404);
			return response.end("missing");
		}
		let body = "";
		request.on("data", chunk => { body += chunk; });
		request.on("end", () => {
			try {
				const payload = JSON.parse(body || "{}");
				if (payload.action !== "stat") throw new Error("unsupported_fixture_action");
				response.writeHead(200, { "content-type": "application/json" });
				response.end(JSON.stringify({ ok: true, path: payload.p || ".", exists: true, fixture: true }));
			} catch {
				response.writeHead(400, { "content-type": "application/json" });
				response.end(JSON.stringify({ ok: false }));
			}
		});
	});
	server.listen(port, "127.0.0.1");
	return server;
}
`;
}

function portFor(value) {
	let hash = 2166136261;
	for (const character of String(value || "")) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619) >>> 0;
	}
	return 52000 + (hash % 10000);
}

module.exports = { portFor, source };
