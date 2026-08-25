// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Routes isolated release HTTP requests through the same public door names.
 * @description
 * The Awtsmoos gives each path its vessel and each vessel its measured light;
 * Awtsmoos.com keeps bootstrap, manifest, descriptor, ZIP, and helper bytes aligned right.
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
		return server.send(
			response,
			200,
			server.installerComponents.buffer,
			"application/gzip"
		);
	}
	if (requestPath === "/apps/tunnel/agent/manifest.txt") {
		return server.send(response, 200, sourceManifest(server), "text/plain");
	}
	if (requestPath === "/api/tunnel/install/bundle-manifest") {
		return server.send(
			response,
			200,
			JSON.stringify(server.descriptor()),
			"application/json"
		);
	}
	if (requestPath === "/api/tunnel/install/agent.zip") {
		return server.send(response, 200, server.bundle, "application/zip");
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

/** Publishes checksum-bound bootstrap source for the isolated installer. */
function sendUnixBootstrap(server, response) {
	const source = fs.readFileSync(
		path.join(server.downloadsRoot, "unix.sh"),
		"utf8"
	);
	const bootstrap = source.replace(
		"__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__",
		server.installerComponents.sha256
	);
	return server.send(response, 200, bootstrap, "text/plain");
}

/** Serves one basename-only installer helper. */
function download(server, response, name) {
	const sourcePath = path.join(server.downloadsRoot, name);
	if (!fs.existsSync(sourcePath)) {
		return server.send(response, 404, "not found\n", "text/plain");
	}
	return server.send(response, 200, fs.readFileSync(sourcePath), "text/plain");
}

/** Reads the repository manifest exactly as the public static route does. */
function sourceManifest(server) {
	return fs.readFileSync(path.join(
		server.repositoryRoot,
		"geelooy/apps/tunnel/agent/manifest.txt"
	));
}

module.exports = {
	respond
};
