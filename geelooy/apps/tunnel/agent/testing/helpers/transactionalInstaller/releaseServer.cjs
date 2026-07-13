// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const Sources = require("../../../../../../api/tunnel/install/tools/zipSources.js");
const Writer = require("../../../../../../api/tunnel/install/tools/zipWriter.js");

/**
 * B"H — Manifests one isolated release endpoint from exact repository bytes.
 * A mutation may shape a failure vessel while every published hash stays true.
 */
class ReleaseServer {
	constructor(repositoryRoot, mutateEntry = entry => entry) {
		this.repositoryRoot = path.resolve(repositoryRoot);
		this.downloadsRoot = path.join(
			this.repositoryRoot,
			"geelooy/apps/tunnel/downloads"
		);
		this.source = Sources.descriptor(this.repositoryRoot);
		this.entries = this.source.entries
			.map(entry => mutateEntry({ path: entry.path, data: Buffer.from(entry.data) }))
			.filter(Boolean);
		this.bundle = Writer.buildZip(this.entries);
		this.bundleSha256 = Sources.hash(this.bundle);
		this.server = http.createServer((request, response) => this.respond(request, response));
	}

	async start() {
		await new Promise((resolve, reject) => {
			this.server.once("error", reject);
			this.server.listen(0, "127.0.0.1", resolve);
		});
		return `http://127.0.0.1:${this.server.address().port}`;
	}

	async close() {
		await new Promise(resolve => this.server.close(resolve));
	}

	respond(request, response) {
		const requestPath = new URL(request.url, "http://localhost").pathname;
		if (requestPath === "/apps/tunnel/agent/manifest.txt") {
			return this.send(response, 200, this.sourceManifest(), "text/plain");
		}
		if (requestPath === "/api/tunnel/install/bundle-manifest") {
			return this.send(response, 200, JSON.stringify(this.descriptor()), "application/json");
		}
		if (requestPath === "/api/tunnel/install/agent.zip") {
			return this.send(response, 200, this.bundle, "application/zip");
		}

		const prefix = "/apps/tunnel/downloads/";
		if (requestPath.startsWith(prefix)) {
			const name = requestPath.slice(prefix.length);
			const sourcePath = path.join(this.downloadsRoot, path.basename(name));
			if (path.basename(name) === name && fs.existsSync(sourcePath)) {
				return this.send(response, 200, fs.readFileSync(sourcePath), "text/plain");
			}
		}
		this.send(response, 404, "not found\n", "text/plain");
	}

	descriptor() {
		return {
			ok: true,
			version: this.source.version,
			files: this.entries.length,
			manifestSha256: this.source.manifestSha256,
			bundles: [{
				name: "agent",
				url: "/api/tunnel/install/agent.zip",
				sha256: this.bundleSha256,
				bytes: this.bundle.length
			}]
		};
	}

	sourceManifest() {
		return fs.readFileSync(path.join(
			this.repositoryRoot,
			"geelooy/apps/tunnel/agent/manifest.txt"
		));
	}

	send(response, status, body, contentType) {
		response.writeHead(status, { "Content-Type": contentType });
		response.end(body);
	}
}

module.exports = { ReleaseServer };
