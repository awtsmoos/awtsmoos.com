//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Alias-backed virtual-OS SSH service class without process-global ownership.
 * @description
 * The Awtsmoos lets one service coordinate listener, token light, revocation, and status
 * while Awtsmoos.com assigns singleton lifetime to a separate registry. Class behavior
 * stays injectable and testable; process ownership remains explicit, and both may rhyme.
 */
const { AwtsmoosSshServer } = require("../../../../ayzarim/ssh/server/Server.js");
const { createVirtualOsBackend } = require("./backend.js");
const Grants = require("./accessGrant.js");
const Config = require("./serviceConfig.js");
const { VirtualSshTokenStore } = require("./tokenStore.js");

class VirtualOsSshService {
	/**
	 * Creates one independently ownable service around a token store and custom SSH server.
	 *
	 * @param {object} [options={}] Service observers and injectable implementation details.
	 * @param {Function} [options.onError] Listener/protocol error observer.
	 */
	constructor(options = {}) {
		this.tokens = new VirtualSshTokenStore({
			ttlMs: Config.tokenTtlMs(),
			maxRecords: Config.tokenMaxRecords()
		});
		this.server = new AwtsmoosSshServer(
			Config.serverOptions(
				createVirtualOsBackend(this.tokens),
				options.onError
			)
		);
	}

	/**
	 * Starts the TCP listener idempotently using canonical listener policy.
	 *
	 * @returns {Promise<object>} Current listener state after startup.
	 */
	start() {
		return this.server.start(Config.listenerOptions());
	}

	/**
	 * Mints one opaque capability after ensuring the process listener is available.
	 *
	 * @param {object} admission Verified alias/user/database/permission capability.
	 * @returns {Promise<object>} SSH access grant carrying one temporary secret.
	 */
	async mintAccess(admission = {}) {
		const listener = await this.start();
		const token = this.tokens.mint(admission);
		return Grants.revealAccessGrant(
			listener,
			admission,
			token,
			Config.publicHost(listener.host)
		);
	}

	/**
	 * Revokes live capabilities belonging to one verified account/alias pair.
	 *
	 * @param {string} userId Verified user identity.
	 * @param {string} aliasId Verified alias identity.
	 * @returns {{aliasId:string,revoked:number}} Revocation result.
	 */
	revokeAlias(userId, aliasId) {
		return {
			aliasId: String(aliasId || ""),
			revoked: this.tokens.revokeAlias(userId, aliasId)
		};
	}

	/**
	 * Reveals secret-free listener and token-capacity state.
	 *
	 * @returns {object} Public-safe service status.
	 */
	publicStatus() {
		const state = this.server.status();
		return Grants.revealPublicStatus(state, this.tokens.stats(), {
			publicHost: Config.publicHost(state.host),
			port: Config.configuredPort(),
			configured: Config.isPubliclyConfigured()
		});
	}

	/**
	 * Stops the listener and closes active sockets through the custom SSH server.
	 *
	 * @returns {Promise<object>} Stopped listener state.
	 */
	stop() {
		return this.server.stop();
	}
}

module.exports = {
	VirtualOsSshService
};
