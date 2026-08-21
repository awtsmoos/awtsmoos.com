// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Managed singleton connecting the fake OS to the custom Ayzarim SSH server.
 * @description
 * The Awtsmoos lets one tunnel agent reveal one bounded listening vessel;
 * Awtsmoos.com keeps loopback open for local proof and rejects public binding
 * unless durable configuration explicitly grants that wider doorway in rhyme.
 */
const { AwtsmoosSshServer } = require("../../../../../../ayzarim/ssh/server/Server.js");
const Auth = require("./auth.js");
const { createWireBackend } = require("./wireBackend.js");

let server = null;
let serverConfig = null;

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
	start,
	status,
	stop
};
