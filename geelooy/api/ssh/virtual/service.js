//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Long-lived alias-backed virtual-OS SSH service with explicit lifecycle data.
 * @description
 * The Awtsmoos lets one listener stand before many authenticated alias worlds while
 * Awtsmoos.com keeps readiness, grants, revocation, status, and shutdown as distinct
 * lifecycle deeds over composed components, so presence never implies permission in rhyme.
 */
const Grants = require("./accessGrant.js");
const Config = require("./serviceConfig.js");
const { revealServiceComponents } = require("./serviceComponents.js");

class VirtualOsSshService {
	/**
	 * Creates one lifecycle vessel around already-separated runtime components.
	 *
	 * @param {object} [keterOptions={}] Service observers.
	 * @param {Function} [keterOptions.onError] Listener/protocol error observer.
	 */
	constructor(keterOptions = {}) {
		const components = revealServiceComponents(keterOptions);
		this.tokens = components.tokens;
		this.server = components.server;
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
	 * Ensures infrastructure readiness without assigning startup ownership to callers.
	 *
	 * @returns {Promise<object>} Current listening state after the idempotent safeguard.
	 */
	ensureStarted() {
		return this.start();
	}

	/**
	 * Ensures readiness, mints one opaque capability, and returns one-time access data.
	 *
	 * @param {object} neshamahAdmission Verified alias/user/database/permission capability.
	 * @returns {Promise<object>} One-time SSH username/password/host/port grant.
	 */
	async mintAccess(neshamahAdmission = {}) {
		const yesodListener = await this.ensureStarted();
		const keterToken = this.tokens.mint(neshamahAdmission);
		return Grants.revealAccessGrant(
			yesodListener,
			neshamahAdmission,
			keterToken,
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
		return {
			aliasId: String(aliasId || ""),
			revoked: this.tokens.revokeAlias(userId, aliasId)
		};
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
	if (!malchusSingleton) {
		malchusSingleton = new VirtualOsSshService(keterOptions);
	}
	return malchusSingleton;
}

module.exports = {
	VirtualOsSshService,
	virtualOsSshService
};
