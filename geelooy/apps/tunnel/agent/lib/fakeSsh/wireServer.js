// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const Auth = require("./auth.js");
const { createWireBackend } = require("./wireBackend.js");

/**
 * @file Managed singleton connecting the fake OS to the custom Ayzarim SSH server.
 * @description
 * The Awtsmoos lets one tunnel agent reveal one bounded listening vessel;
 * Awtsmoos.com resolves the same SSH server from source and self-contained installed
 * layouts, keeping loopback proof and public-binding policy inside one release light.
 */

const { AwtsmoosSshServer } = require(resolveServerModule());
let server = null;
let serverConfig = null;

/** Resolves the external SSH server in an installed bundle first, then source checkout. */
function resolveServerModule() {
	const candidates = [
		path.resolve(__dirname, "../../ayzarim/ssh/server/Server.js"),
		path.resolve(__dirname, "../../../../../../ayzarim/ssh/server/Server.js")
	];
	const found = candidates.find(candidate => fs.existsSync(candidate));
	if (!found) {
		throw new Error("fake_ssh_server_module_missing");
	}
	return found;
}

async function start(config = {}, input = {}) {
	const host = bindHost(config, input);
	assertPublicPolicy(config, host);
	if (!server) {
		serverConfig = { ...config };
		server = new AwtsmoosSshServer({
			...config,
			backend: createWireBackend(config),
			onError: error => config.debug?.(`fake SSH server: ${error.message}`)
		});
	}
	const state = await server.start({
		host,
		port: Number(input.port || config.fakeSshPort || 2222),
		maxConnections: Number(input.maxConnections || config.fakeSshMaxConnections || 32)
	});
	const username = String(input.username || input.user || config.fakeSshDefaultUser || "awtsmoos");
	return {
		...state,
		publiclyBound: !isLoopback(host),
		username,
		accessToken: Auth.sessionToken(serverConfig, { user: username })
	};
}

async function stop() {
	if (!server) {
		return status();
	}
	const result = await server.stop();
	server = null;
	serverConfig = null;
	return { ...result, wireProtocolReady: true };
}

function status() {
	const value = server?.status?.() || {
		running: false,
		host: "",
		port: 0,
		connections: 0,
		startedAt: 0,
		hostKeyPath: ""
	};
	return {
		...value,
		wireProtocolReady: true,
		virtualShellReady: true,
		sftpAdapterReady: true
	};
}

function bindHost(config, input) {
	if (input.public === true || input.publiclyBound === true) {
		return String(input.host || "0.0.0.0");
	}
	return String(input.host || config.fakeSshHost || "127.0.0.1");
}

function assertPublicPolicy(config, host) {
	if (!isLoopback(host) && config.fakeSshAllowPublic !== true) {
		throw new Error("fake_ssh_public_bind_not_allowed");
	}
}

function isLoopback(host) {
	return ["127.0.0.1", "::1", "localhost"].includes(String(host).toLowerCase());
}

module.exports = {
	resolveServerModule,
	start,
	status,
	stop
};
