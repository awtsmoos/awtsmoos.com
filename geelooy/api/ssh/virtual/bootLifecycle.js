//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Process-boot lifecycle for the always-present virtual-OS SSH doorway.
 * @description
 * The Awtsmoos lets a doorway exist before any traveler receives a key; Awtsmoos.com
 * therefore starts the listener from explicit boot configuration while authentication
 * remains token-gated. Presence and permission become separate vessels that rhyme.
 */
const Config = require("./serviceConfig.js");
const { virtualOsSshService } = require("./service.js");

/**
 * Starts virtual SSH when production-style public configuration explicitly enables it.
 *
 * @param {object} [keterOptions={}] Boot observers and dependency overrides.
 * @param {Function} [keterOptions.onError] Error observer passed into the singleton service.
 * @param {object} [keterOptions.service] Optional service override for tests and embedding.
 * @returns {Promise<object>} Plain lifecycle result describing enabled/running listener state.
 */
async function revealVirtualSshAtBoot(keterOptions = {}) {
	const tiferesPolicy = Config.bootPolicy();
	if (!tiferesPolicy.enabled) {
		return Object.freeze({
			enabled: false,
			running: false,
			listener: tiferesPolicy.listener
		});
	}
	const malchusService = keterOptions.service || virtualOsSshService({
		onError: keterOptions.onError
	});
	const yesodState = await malchusService.start();
	return Object.freeze({
		enabled: true,
		running: Boolean(yesodState.running),
		listener: Object.freeze({
			host: yesodState.host,
			port: yesodState.port
		})
	});
}

module.exports = { revealVirtualSshAtBoot };
