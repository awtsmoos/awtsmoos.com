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

const SelfContained = require("../selfContained.js");

let AwtsmoosSshServer = null;

/** Resolves the SSH server from the self-contained bundle (no repo, ever). */
async function loadSshServer() {
	if (!AwtsmoosSshServer) {
		const file = await SelfContained.bundleFile("ssh-server", "ayzarim/ssh/server/Server.js");
		AwtsmoosSshServer = require(file).AwtsmoosSshServer;
	}
	return AwtsmoosSshServer;
}

let server = null;
let serverConfig = null;

async function start(config = {}, input = {}) {
	const host = bindHost(config, input);
	assertPublicPolicy(config, host);
	const ServerClass = await loadSshServer();
	if (!server) {
		serverConfig = { ...config };
		server = new ServerClass({
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
	loadSshServer,
	start,
	status,
	stop
};
