//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Environment and host-identity configuration for the true virtual OS SSH service.
 * @description
 * The Awtsmoos lets address, public name, limits, token capacity, and host key each
 * keep a measured vessel. Awtsmoos.com centralizes those boundaries so lifecycle
 * code remains small and public exposure can never arrive accidentally in rhyme.
 */
const os = require("os");
const path = require("path");
const TokenLimits = require("./tokenLimits.js");

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 2223;

function listenerOptions() {
	return {
		host: process.env.VIRTUAL_SSH_HOST || DEFAULT_HOST,
		port: numberEnv("VIRTUAL_SSH_PORT", DEFAULT_PORT),
		maxConnections: numberEnv("VIRTUAL_SSH_MAX_CONNECTIONS", 64)
	};
}

function serverOptions(backend, onError) {
	return {
		backend,
		fakeSshHostKeyPath: hostKeyPath(),
		maxConnections: numberEnv("VIRTUAL_SSH_MAX_CONNECTIONS", 64),
		idleMs: numberEnv("VIRTUAL_SSH_IDLE_MS", 30 * 60 * 1000),
		maxConnectionsPerWindow: numberEnv("VIRTUAL_SSH_CONNECTIONS_PER_MINUTE", 60),
		connectionWindowMs: 60 * 1000,
		onError
	};
}

function tokenTtlMs() {
	return numberEnv("VIRTUAL_SSH_TOKEN_TTL_MS", TokenLimits.DEFAULT_TTL_MS);
}

function tokenMaxRecords() {
	return numberEnv(
		"VIRTUAL_SSH_TOKEN_MAX_RECORDS",
		TokenLimits.DEFAULT_MAX_RECORDS
	);
}

function publicHost(boundHost) {
	return process.env.VIRTUAL_SSH_PUBLIC_HOST || boundHost || DEFAULT_HOST;
}

function configuredPort() {
	return numberEnv("VIRTUAL_SSH_PORT", DEFAULT_PORT);
}

function isPubliclyConfigured() {
	return Boolean(process.env.VIRTUAL_SSH_HOST || process.env.VIRTUAL_SSH_PUBLIC_HOST);
}

function hostKeyPath() {
	return process.env.VIRTUAL_SSH_HOST_KEY_PATH || path.join(
		os.homedir(),
		".awtsmoos",
		"virtual-ssh",
		"host-key-rsa.pem"
	);
}

function numberEnv(name, fallback) {
	const value = Number(process.env[name]);
	return Number.isFinite(value) && value > 0
		? Math.floor(value)
		: fallback;
}

module.exports = {
	configuredPort,
	isPubliclyConfigured,
	listenerOptions,
	publicHost,
	serverOptions,
	tokenMaxRecords,
	tokenTtlMs
};
