//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Boot-time lifecycle for the alias-backed virtual OS SSH listener.
 * @description
 * The Awtsmoos lets the SSH doorway exist before any credential is minted, while
 * Awtsmoos.com keeps Gevurah at the authentication boundary: listening grants no
 * alias access, and only short-lived verified tokens may enter the inner world in rhyme.
 */
const Config = require("./serviceConfig.js");
const { virtualOsSshService } = require("./service.js");

/**
 * Starts the configured virtual-OS SSH listener during process revelation.
 *
 * @param {object} [options={}] Injectable lifecycle vessels for deterministic tests.
 * @param {boolean} [options.configured] Explicit configuration witness.
 * @param {object} [options.service] Virtual SSH service implementation.
 * @param {Function} [options.log] Operational logger.
 * @param {Function} [options.onError] Accepted-connection error observer.
 * @returns {Promise<object>} Listener state or an explicit skipped state.
 */
async function revealVirtualSshAtBoot(options = {}) {
	const isConfigured = options.configured ?? Config.isPubliclyConfigured();
	const log = options.log || console.log;
	if (!isConfigured) {
		const hiddenState = {
			running: false,
			skipped: true,
			port: Config.configuredPort()
		};
		log('B"H - Virtual SSH boot listener is not publicly configured.');
		return hiddenState;
	}

	const sshService = options.service || virtualOsSshService({
		onError: options.onError || reportListenerError
	});
	const listenerState = await sshService.start();
	if (!listenerState?.running) {
		throw new Error("virtual_ssh_boot_listener_not_running");
	}

	log(
		`B"H - Virtual SSH listening on ${listenerState.host}:${listenerState.port}.`
	);
	return {
		...listenerState,
		skipped: false
	};
}

/**
 * Reports connection-level rupture without weakening authentication or boot truth.
 *
 * @param {Error} error Listener or accepted-connection error.
 * @returns {void}
 */
function reportListenerError(error) {
	console.warn(
		'B"H - virtual OS SSH listener error:',
		error?.message || String(error)
	);
}

module.exports = {
	revealVirtualSshAtBoot
};
