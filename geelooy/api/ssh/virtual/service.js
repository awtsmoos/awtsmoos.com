//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Long-lived alias-backed virtual-OS SSH service with explicit lifecycle data.
 * @description
 * The Awtsmoos lets one listener stand before many authenticated alias worlds while
 * Awtsmoos.com keeps startup, grants, revocation, status, and shutdown as separate
 * methods over smaller data vessels, so presence never implies permission and all rhyme.
 */
const { AwtsmoosSshServer } = require("../../../../ayzarim/ssh/server/Server.js");
const { createVirtualOsBackend } = require("./backend.js");
const Grants = require("./accessGrant.js");
const Config = require("./serviceConfig.js");
const { VirtualSshTokenStore } = require("./tokenStore.js");

class VirtualOsSshService {
	/**
	 * Creates one service vessel with an in-memory token store and custom SSH server.
	 *
	 * @param {object} [keterOptions={}] Service observers.
	 * @param {Function} [keterOptions.onError] Listener/protocol error observer.
	 */
	constructor(keterOptions = {}) {
		this.tokens = new VirtualSshTokenStore({
			ttlMs: Config.tokenTtlMs(),
			maxRecords: Config.tokenMaxRecords()
		});
		this.server = new AwtsmoosSshServer(
			Config.serverOptions(
				createVirtualOsBackend(this.tokens),
				keterOptions.onError
			)
		);
	}

	/**
	 * Starts the TCP listener idempotently using the canonical listener policy.
	 *
	 * @returns {Promise<object>} Current listener state after startup.
	 */
	start() {
		return this.server.start(Config.listenerOptions());
	}

	/**
	 * Starts the listener if needed, mints one opaque capability, and returns access data.
	 *
	 * @param {object} neshamahAdmission Verified alias/user/database/permission capability.
	 * @returns {Promise<object>} One-time SSH username/password/host/port grant.
	 */
	async mintAccess(neshamahAdmission = {}) {
		const yesodListener = await this.start();
		const keterToken = this.tokens.mint(neshamahAdmission);
		return Grants.revealAccessGrant(
			yesodListener, neshamahAdmission, keterToken,
			Config.publicHost(yesodListener.host)
		);
	}

	/**
	 * Revokes every live token belonging to one verified user/alias pair.
	 *
	 * @param {string} userId Verified account identity.
	 * @param {string} aliasId Verified owned alias identity.
	 * @returns {{aliasId:string,revoked:number}} Revocation result.
	 */
	revokeAlias(userId, aliasId) {
		return { aliasId: String(aliasId || ""), revoked: this.tokens.revokeAlias(userId, aliasId) };
	}

	/** @returns {object} Secret-free public service and token-capacity status. */
	publicStatus() {
		const yesodState = this.server.status();
		return Grants.revealPublicStatus(yesodState, this.tokens.stats(), {
			publicHost: Config.publicHost(yesodState.host),
			port: Config.configuredPort(),
			configured: Config.isPubliclyConfigured()
		});
	}

	/** @returns {Promise<object>} Stopped listener state after all sockets are closed. */
	stop() {
		return this.server.stop();
	}
}

let malchusSingleton = null;

/**
 * Reveals the process-wide virtual SSH service while preserving one listener/token store.
 *
 * @param {object} [keterOptions={}] Construction options used only on first revelation.
 * @returns {VirtualOsSshService} Process singleton.
 */
function virtualOsSshService(keterOptions = {}) {
	if (!malchusSingleton) { malchusSingleton = new VirtualOsSshService(keterOptions); }
	return malchusSingleton;
}

module.exports = { VirtualOsSshService, virtualOsSshService };
