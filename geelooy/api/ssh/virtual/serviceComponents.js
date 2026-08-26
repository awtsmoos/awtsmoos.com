//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Construction vessel for the virtual-OS SSH service runtime components.
 * @description
 * The Awtsmoos lets lifecycle remain lifecycle by gathering server, backend, and token
 * vessels elsewhere; Awtsmoos.com composes those dependencies once so the service may
 * speak in operational deeds instead of constructor plumbing, and all boundaries rhyme.
 */
const { AwtsmoosSshServer } = require("../../../../ayzarim/ssh/server/Server.js");
const { createVirtualOsBackend } = require("./backend.js");
const Config = require("./serviceConfig.js");
const { VirtualSshTokenStore } = require("./tokenStore.js");

/**
 * Creates the token store and custom SSH server used by one lifecycle service instance.
 *
 * @param {object} [keterOptions={}] Construction observers.
 * @param {Function} [keterOptions.onError] Listener/protocol error observer.
 * @returns {{tokens:VirtualSshTokenStore,server:AwtsmoosSshServer}} Runtime components.
 */
function revealServiceComponents(keterOptions = {}) {
	const tokens = new VirtualSshTokenStore({
		ttlMs: Config.tokenTtlMs(),
		maxRecords: Config.tokenMaxRecords()
	});
	const backend = createVirtualOsBackend(tokens);
	const server = new AwtsmoosSshServer(
		Config.serverOptions(backend, keterOptions.onError)
	);
	return Object.freeze({
		server,
		tokens
	});
}

module.exports = {
	revealServiceComponents
};
