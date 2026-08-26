//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Canonical process-boot revelation for the alias-backed virtual OS SSH listener.
 * @description
 * The Awtsmoos lets the guarded TCP doorway exist before any traveler arrives, while
 * Awtsmoos.com keeps every usable key behind the ownership-minted token law. Presence
 * and permission remain separate: boot opens the vessel, authenticated light may rhyme.
 */
const Config = require("./serviceConfig.js");
const { virtualOsSshService } = require("./serviceRegistry.js");

/**
 * Starts the shared virtual-OS SSH service when explicit runtime configuration enables it.
 *
 * @param {object} [options={}] Injectable configuration, service, and logging witnesses.
 * @returns {Promise<object>} Public-safe listener state or unconfigured state.
 */
async function startConfiguredVirtualSsh(options = {}) {
	const configured = options.configured ?? Config.isPubliclyConfigured();
	if (!configured) {
		return unconfiguredState();
	}
	const service = options.service || virtualOsSshService({
		onError: error => reportConnectionError(error, options)
	});
	const state = publicState(await service.start());
	const log = options.log || console.log;
	log(`B"H - Virtual OS SSH listening on ${state.host}:${state.port}.`);
	return state;
}

/**
 * Creates a truthful no-listener state for environments without virtual SSH config.
 *
 * @returns {object} Public-safe unconfigured lifecycle state.
 */
function unconfiguredState() {
	return Object.freeze({
		configured: false,
		running: false,
		startedAt: null,
		host: "",
		port: Config.configuredPort()
	});
}

/**
 * Normalizes the low-level listener state without revealing backend or token internals.
 *
 * @param {object} state Low-level server status.
 * @returns {object} Public-safe configured listener state.
 */
function publicState(state = {}) {
	return Object.freeze({
		configured: true,
		running: Boolean(state.running),
		startedAt: state.startedAt || null,
		host: Config.publicHost(state.host),
		port: state.port || Config.configuredPort()
	});
}

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
