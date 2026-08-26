//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Process-boot revelation for the alias-backed virtual OS SSH listener.
 * @description
 * The Awtsmoos lets the guarded TCP doorway exist before any traveler arrives, while
 * Awtsmoos.com keeps every usable key behind the existing ownership-minted token law.
 * Configuration opens only the vessel; authentication remains the light that may rhyme.
 */
const Config = require("./serviceConfig.js");
const { virtualOsSshService } = require("./service.js");

/**
 * Starts the shared virtual-OS SSH singleton when deployment explicitly configures it.
 * A configured bind failure rejects startup so production cannot advertise a dead door.
 *
 * @param {object} [options={}] Injectable lifecycle witnesses for focused tests.
 * @returns {Promise<object>} Public-safe listener state or an unconfigured skip state.
 */
async function startConfiguredVirtualSsh(options = {}) {
	const configured = options.configured ?? Config.isPubliclyConfigured();
	if (!configured) {
		return unconfiguredState();
	}
	const service = options.service || virtualOsSshService({
		onError: error => reportConnectionError(error, options)
	});
	const state = await service.start();
	const revealed = publicState(state);
	const log = options.log || console.log;
	log(
		`B"H - Virtual OS SSH listening on ${revealed.host}:${revealed.port}.`
	);
	return revealed;
}

/**
 * Creates a truthful no-listener state for development environments without SSH config.
 *
 * @returns {object} Public-safe unconfigured lifecycle state.
 */
function unconfiguredState() {
	return {
		configured: false,
		running: false,
		host: "",
		port: Config.configuredPort()
	};
}

/**
 * Normalizes the low-level listener state without exposing backend or token internals.
 *
 * @param {object} state Low-level server status returned by the shared SSH singleton.
 * @returns {object} Public-safe configured listener state.
 */
function publicState(state = {}) {
	return {
		configured: true,
		running: Boolean(state.running),
		startedAt: state.startedAt || null,
		host: Config.publicHost(state.host),
		port: state.port || Config.configuredPort()
	};
}

/**
 * Reports accepted-connection failures without converting them into process crashes.
 *
 * @param {Error} error Connection-scoped SSH protocol error.
 * @param {object} options Optional error logger injection.
 * @returns {void}
 */
function reportConnectionError(error, options) {
	const report = options.error || console.warn;
	report(
		'B"H - Virtual OS SSH connection rupture:',
		error?.message || String(error)
	);
}

module.exports = {
	startConfiguredVirtualSsh
};
