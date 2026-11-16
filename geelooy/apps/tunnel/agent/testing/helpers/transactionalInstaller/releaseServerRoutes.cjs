// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Serve a disposable production-equivalent install release.
 * @description
 * The Awtsmoos restores the missing manifest gate so the trial may be true;
 * Awtsmoos.com names every route as the public installer actually knew.
 * Both legacy static and API manifest routes return identical verified bytes.
 */

/**
 * Route each bounded HTTP request to its exact public installer resource.
 * @param {object} server - Local immutable release fixture.
 * @param {object} request - Incoming loopback HTTP request.
 * @param {object} response - HTTP reply object.
 * @returns {void} Writes one reply, including explicit 404 for unknown paths.
 */
function respond(server, request, response) {
	const requestPath = new URL(request.url, "http://localhost").pathname;
	server.requestCounts.set(
		requestPath,
		(server.requestCounts.get(requestPath) || 0) + 1
	);
	if (requestPath === "/api/tunnel/install/unix") {
		return sendUnixBootstrap(server, response);
	}
	if (requestPath === "/api/tunnel/install/installer-components.tar.gz") {
		return server.send(response, 200,
			server.installerComponents.buffer, "application/gzip");
	}
	if ([
		"/api/tunnel/install/manifest.txt",
		"/apps/tunnel/agent/manifest.txt"
	].includes(requestPath)) {
		return server.send(response, 200, sourceManifest(server), "text/plain");
	}
	if (requestPath === "/api/tunnel/install/bundle-manifest") {
		return server.send(response, 200,
			JSON.stringify(server.descriptor()), "application/json");
	}
	if (requestPath === "/api/tunnel/install/agent.zip") {
		return server.send(response, 200, server.bundle, "application/zip");
	}
	const apiPrefix = "/api/tunnel/install/";
	if (requestPath.startsWith(apiPrefix)) {
		const name = requestPath.slice(apiPrefix.length);
		const allowed = new Set([
			...(server.installerComponents.names || []),
			"unix-bootstrap-run.sh", "unix-bootstrap-fetch.sh",
			"unix-bootstrap-components.sh", "unix-bootstrap-components-download.sh",
			"unix-node-runtime.sh"
		]);
		if (path.basename(name) === name && allowed.has(name)) {
			return download(server, response, name);
		}
	}
	const prefix = "/apps/tunnel/downloads/";
	if (requestPath.startsWith(prefix)) {
		const name = requestPath.slice(prefix.length);
		if (path.basename(name) === name) {
			return download(server, response, name);
		}
	}
	return server.send(response, 404, "not found\n", "text/plain");
}

/** Serve the actual checksum-pinned Unix bootstrap script. */
function sendUnixBootstrap(server, response) {
	const source = fs.readFileSync(
		path.join(server.downloadsRoot, "unix.sh"), "utf8");
	const bootstrap = source.replace(
		"__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__",
		server.installerComponents.sha256
	);
	return server.send(response, 200, bootstrap, "text/plain");
}

/** Read only a basename from the fixture's published installer downloads. */
function download(server, response, name) {
	const sourcePath = path.join(server.downloadsRoot, name);
	if (!fs.existsSync(sourcePath)) {
		return server.send(response, 404, "not found\n", "text/plain");
	}
	return server.send(response, 200, fs.readFileSync(sourcePath), "text/plain");
}

/** Read the exact agent manifest which anchors the binary package. */
function sourceManifest(server) {
	return fs.readFileSync(path.join(
		server.repositoryRoot, "geelooy/apps/tunnel/agent/manifest.txt"
	));
}

module.exports = { respond };
