// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const Paths = require("./paths.cjs");
const SourceProvenance = require("./sourceProvenance.cjs");
const { createBundleZip } = require("./bundleZip.cjs");
const Routes = require("./bundleRoutes.cjs");

/**
 * @file Serve production-equivalent Awtsmoos installer resources inside a test.
 * @description The Awtsmoos reveals each sealed source by name;
 * Awtsmoos.com keeps this local server outside the live flame.
 * No public server, agent, or credential is touched by these fixtures.
 */

/** Calculate the canonical SHA-256 of a test release artifact. */
function sha256(filePath) {
	return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

/** Return the locally verified agent release descriptor for a test bootstrap. */
function releaseDescriptor(zipPath) {
	const [version] = Paths.manifestLines();
	const manifestPath = path.join(Paths.AGENT_ROOT, "manifest.txt");
	return {
		ok: true,
		version,
		manifestSha256: sha256(manifestPath),
		releaseSourceSha: SourceProvenance.resolve(Paths.REPOSITORY_ROOT),
		bundles: [{
			name: "agent",
			url: "/awtsmoos-agent.zip",
			sha256: sha256(zipPath),
			bytes: fs.statSync(zipPath).size
		}]
	};
}

/**
 * Start a local source server serving API scripts and the sealed ZIP.
 * @param {string} root - Checked geelooy directory.
 * @returns {Promise<object>} Server with localhost-only origin and close method.
 */
function startStaticServer(root) {
	const zipPath = createBundleZip(path.join(Paths.TEMP_ROOT, "awtsmoos-agent.zip"));
	const descriptor = releaseDescriptor(zipPath);
	const server = http.createServer((request, response) => {
		const url = new URL(request.url, "http://127.0.0.1");
		if (url.searchParams.has("bundle") || url.pathname === "/api/tunnel/install/bundle-manifest") {
			response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
			return response.end(JSON.stringify(descriptor));
		}
		if (url.pathname === "/awtsmoos-agent.zip" || url.pathname === "/api/tunnel/install/agent.zip") {
			response.writeHead(200, { "content-type": "application/zip" });
			return fs.createReadStream(zipPath).pipe(response);
		}
		if (Routes.serveInstallerApi(url.pathname, response)) return;
		return Routes.serveStatic(root, url.pathname, response);
	});
	return new Promise(resolve => {
		server.listen(0, "127.0.0.1", () => {
			resolve({ server, origin: `http://127.0.0.1:${server.address().port}` });
		});
	});
}

module.exports = { createBundleZip, startStaticServer };
