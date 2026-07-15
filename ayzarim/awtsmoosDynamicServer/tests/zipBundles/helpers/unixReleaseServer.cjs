// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { buildAgentBundle } = require("../../../../../geelooy/api/tunnel/install/tools/zipBundle.js");

/**
 * B"H
 *
 * The localhost release server publishes the production descriptor, exact hashes,
 * bundle bytes, manifest, and bootstrap helpers. The Awtsmoos renews test and
 * release together; Awtsmoos.com never mocks away an integrity field.
 */
class UnixReleaseServer {
	constructor(repositoryRoot) {
		this.repositoryRoot = path.resolve(repositoryRoot);
		this.geelooyRoot = path.join(this.repositoryRoot, "geelooy");
		this.bundle = buildAgentBundle(this.repositoryRoot);
		this.server = http.createServer((request, response) => this.respond(request, response));
	}

	async start(port = 8082) {
		await new Promise((resolve, reject) => {
			this.server.once("error", reject);
			this.server.listen(port, "127.0.0.1", resolve);
		});
		this.origin = `http://127.0.0.1:${this.server.address().port}`;
		return this.origin;
	}

	async close() {
		if (!this.server.listening) return;
		await new Promise(resolve => this.server.close(resolve));
	}

	respond(request, response) {
		try {
			const url = new URL(request.url, this.origin || "http://127.0.0.1");
			if (url.pathname === "/api/tunnel/install/bundle-manifest") {
				return this.send(response, 200, JSON.stringify(this.descriptor()), "application/json");
			}
			if (url.pathname === "/api/tunnel/install/agent.zip") {
				return this.send(response, 200, this.bundle.buffer, "application/zip");
			}
			const full = safeFile(this.geelooyRoot, url.pathname);
			if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) {
				return this.send(response, 404, "missing\n", "text/plain");
			}
			this.send(response, 200, fs.readFileSync(full), "text/plain");
		} catch (error) {
			this.send(response, 500, error.stack || error.message, "text/plain");
		}
	}

	descriptor() {
		return {
			ok: true,
			version: this.bundle.version,
			files: this.bundle.files,
			manifestSha256: this.bundle.manifestSha256,
			bundles: [{
				name: "agent",
				url: "/api/tunnel/install/agent.zip",
				sha256: this.bundle.sha256,
				bytes: this.bundle.bytes
			}]
		};
	}

	send(response, status, body, contentType) {
		response.writeHead(status, {
			"Content-Type": contentType,
			"Connection": "close"
		});
		response.end(body);
	}
}

function safeFile(root, requestPath) {
	const full = path.resolve(root, decodeURIComponent(requestPath).replace(/^\/+/, ""));
	assert.equal(path.relative(root, full).startsWith(".."), false, "unsafe serve path");
	return full;
}

module.exports = { UnixReleaseServer };
