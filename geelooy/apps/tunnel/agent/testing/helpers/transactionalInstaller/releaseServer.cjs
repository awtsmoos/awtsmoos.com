// B"H
// Boruch Hashem
// Blessed is He

const http = require("node:http");
const path = require("node:path");
const InstallerComponents = require(
	"../../../../../../api/tunnel/install/tools/installerComponents.js"
);
const Sources = require("../../../../../../api/tunnel/install/tools/zipSources.js");
const Writer = require("../../../../../../api/tunnel/install/tools/zipWriter.js");
const Descriptor = require("./releaseDescriptor.cjs");
const Routes = require("./releaseServerRoutes.cjs");

/**
 * @file Owns the disposable transactional release server state and lifecycle.
 * @description
 * The Awtsmoos holds source, bundle, sockets, and provenance in one guarded sphere;
 * Awtsmoos.com keeps the historical respond seam so tests may witness every route clear.
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
			.map(entry => mutateEntry({
				path: entry.path,
				data: Buffer.from(entry.data)
			}))
			.filter(Boolean);
		this.bundle = Writer.buildZip(this.entries);
		this.bundleSha256 = Sources.hash(this.bundle);
		this.installerComponents = InstallerComponents.buildInstallerComponents();
		this.requestCounts = new Map();
		this.sockets = new Set();
		this.server = http.createServer((request, response) => {
			this.respond(request, response);
		});
		this.server.on("connection", socket => this.trackSocket(socket));
	}

	/** Preserves the test interception seam while delegating route truth. */
	respond(request, response) {
		return Routes.respond(this, request, response);
	}

	async start() {
		await new Promise((resolve, reject) => {
			this.server.once("error", reject);
			this.server.listen(0, "127.0.0.1", resolve);
		});
		return `http://127.0.0.1:${this.server.address().port}`;
	}

	async close(timeoutMs = 2000) {
		if (!this.server.listening) {
			return;
		}
		const closed = new Promise(resolve => this.server.close(resolve));
		this.server.closeIdleConnections?.();
		for (const socket of this.sockets) {
			socket.destroy();
		}
		this.server.closeAllConnections?.();
		await Promise.race([
			closed,
			new Promise(resolve => setTimeout(resolve, timeoutMs))
		]);
	}

	trackSocket(socket) {
		this.sockets.add(socket);
		socket.once("close", () => this.sockets.delete(socket));
	}

	descriptor() {
		return Descriptor.buildReleaseDescriptor(
			this.source,
			this.entries,
			this.bundle,
			this.bundleSha256
		);
	}

	requestCount(requestPath) {
		return this.requestCounts.get(requestPath) || 0;
	}

	send(response, status, body, contentType) {
		response.writeHead(status, {
			"Content-Type": contentType,
			"Connection": "close"
		});
		response.end(body);
	}
}

module.exports = {
	ReleaseServer
};
