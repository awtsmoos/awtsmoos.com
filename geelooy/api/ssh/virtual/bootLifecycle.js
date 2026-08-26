//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Compatibility lifecycle view over the canonical virtual-SSH boot function.
 * @description
 * The Awtsmoos keeps one startup law even when older tests and callers ask for another
 * response garment. Awtsmoos.com adapts the canonical boot record here instead of
 * maintaining a second listener algorithm, so compatibility and truth may rhyme.
 */
const Config = require("./serviceConfig.js");
const { startConfiguredVirtualSsh } = require("./boot.js");

/**
 * Reveals the historic enabled/running/listener shape while delegating startup behavior.
 *
 * @param {object} [options={}] Service and observer overrides.
 * @returns {Promise<object>} Compatibility lifecycle state.
 */
async function revealVirtualSshAtBoot(options = {}) {
	const policy = Config.bootPolicy();
	const state = await startConfiguredVirtualSsh({
		...options,
		configured: policy.enabled,
		log: options.log || (() => {})
	});
	return Object.freeze({
		enabled: state.configured,
		running: state.running,
		listener: Object.freeze({
			host: state.host || policy.listener.host,
			port: state.port || policy.listener.port
		})
	});
}

module.exports = {
	revealVirtualSshAtBoot
};
