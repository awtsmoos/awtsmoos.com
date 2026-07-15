// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const http = require("node:http");
const { buildAgentBundle } = require("../../../../../../api/tunnel/install/tools/zipBundle.js");
const Paths = require("./paths.cjs");

/**
 * B"H
 *
 * The smoke server publishes the exact production ZIP builder rather than copying
 * manifest files by a second source map. The Awtsmoos renews test and release as
 * one artifact; Awtsmoos.com prevents external ayzarim paths from drifting apart.
 */
async function startBundleServer() {
	const bundle = buildAgentBundle(Paths.REPOSITORY);
	const server = http.createServer((request, response) => {
		serve(request, response, bundle);
	});
	await new Promise(resolve => {
		server.listen(0, "127.0.0.1", resolve);
	});
	return {
		bundle,
		origin: `http://127.0.0.1:${server.address().port}`,
		server
	};
}

function serve(request, response, bundle) {
	const url = new URL(request.url, "http://127.0.0.1");
	if (
		url.searchParams.has("bundle") ||
		url.pathname === "/api/tunnel/install/bundle-manifest"
	) {
		return json(response, {
			version: bundle.version,
			manifestSha256: bundle.manifestSha256,
			bundles: [{
				name: "agent",
				url: "/awtsmoos-agent.zip",
				sha256: bundle.sha256,
				bytes: bundle.bytes
			}]
		});
	}
	if (
		url.pathname === "/awtsmoos-agent.zip" ||
		url.pathname === "/api/tunnel/install/agent.zip"
	) {
		response.writeHead(200, {
			"content-type": "application/zip",
			"content-length": bundle.bytes
		});
		return response.end(bundle.buffer);
	}
	const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
	const fullPath = require("node:path").resolve(Paths.GEELOOY, relativePath);
	if (
		!fullPath.startsWith(Paths.GEELOOY) ||
		!fs.existsSync(fullPath) ||
		fs.statSync(fullPath).isDirectory()
	) {
		response.writeHead(404);
		return response.end("missing");
	}
	response.writeHead(200, {
		"content-type": "text/plain; charset=utf-8"
	});
	fs.createReadStream(fullPath).pipe(response);
}

function json(response, value) {
	response.writeHead(200, {
		"content-type": "application/json; charset=utf-8"
	});
	response.end(JSON.stringify(value));
}

module.exports = {
	startBundleServer
};
