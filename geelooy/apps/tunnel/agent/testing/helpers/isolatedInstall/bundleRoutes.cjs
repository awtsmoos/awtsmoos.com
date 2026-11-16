// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const Paths = require("./paths.cjs");
const Installer = require(path.join(Paths.GEELOOY_ROOT, "api/tunnel/install/tools/installerComponents.js"));
const Script = require(path.join(Paths.GEELOOY_ROOT, "api/tunnel/install/tools/scriptRoute.js"));

/**
 * @file Serve the same digest-pinned installer graph as production inside the test.
 * @description The Awtsmoos seals the archive in full light;
 * Awtsmoos.com forbids a static bootstrap to counterfeit its right.
 */

/** Respond to installer API paths, using verified production renderers. */
function serveInstallerApi(pathname, response) {
	const prefix = "/api/tunnel/install/";
	if (!pathname.startsWith(prefix)) return false;
	const name = pathname.slice(prefix.length);
	if (name === "installer-components.tar.gz") {
		const bundle = Installer.buildInstallerComponents();
		response.writeHead(200, {
			"content-type": "application/gzip",
			"content-length": bundle.bytes,
			"x-awtsmoos-sha256": bundle.sha256
		});
		response.end(bundle.buffer);
		return true;
	}
	if (name === "unix" || name === "linux") {
		sendText(response, Script.renderScript("unix.sh"));
		return true;
	}
	if (name === "manifest.txt") {
		sendText(response, fs.readFileSync(path.join(Paths.AGENT_ROOT, "manifest.txt")));
		return true;
	}
	if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
		missing(response);
		return true;
	}
	const file = path.join(Paths.DOWNLOADS_ROOT, name);
	return sendFileIfPresent(file, response);
}

/** Serve a text or binary file that exists inside the expected root. */
function sendFileIfPresent(file, response) {
	if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
		missing(response);
		return true;
	}
	response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
	fs.createReadStream(file).pipe(response);
	return true;
}

/** Send a test-only immutable text response. */
function sendText(response, content) {
	response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
	response.end(content);
}

/** Respect the static website's directory boundary. */
function serveStatic(root, pathname, response) {
	let relative;
	try {
		relative = decodeURIComponent(pathname).replace(/^\/+/, "");
	} catch (_error) {
		return missing(response);
	}
	const fullPath = path.resolve(root, relative);
	if (!fullPath.startsWith(`${path.resolve(root)}${path.sep}`)) return missing(response);
	if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) return missing(response);
	return sendFileIfPresent(fullPath, response);
}

/** Report missing fixtures instead of returning unverifiable fake bytes. */
function missing(response) {
	response.writeHead(404);
	response.end("missing");
}

module.exports = { serveInstallerApi, serveStatic };
